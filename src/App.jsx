// CRM-Shopee-React (Atualizado para GitHub Pages)
// ---------------------------------------------------
// CONFIGURAÇÃO PARA DEPLOY NO GITHUB PAGES
// 1) Instale o pacote gh-pages:
//      npm install gh-pages --save-dev
//
// 2) Edite o arquivo package.json adicionando:
//      {
//        "homepage": "https://SEU_USUARIO.github.io/NOME_DO_REPOSITORIO",
//        "scripts": {
//          "predeploy": "npm run build",
//          "deploy": "gh-pages -d dist"
//        }
//      }
//    *Troque SEU_USUARIO e NOME_DO_REPOSITORIO pelo nome do seu GitHub e do repositório.*
//
// 3) Caso esteja usando Vite (recomendado), edite vite.config.js:
//      import { defineConfig } from 'vite'
//      import react from '@vitejs/plugin-react'
//      export default defineConfig({
//        plugins: [react()],
//        base: '/NOME_DO_REPOSITORIO/'
//      })
//
// 4) Gere o build e publique:
//      npm run deploy
//
// 5) Depois acesse a URL:
//      https://SEU_USUARIO.github.io/NOME_DO_REPOSITORIO
//
// ---------------------------------------------------
// CRM-Shopee-React - Single-file React App (App.jsx)
// ---------------------------------------------------
// SUMMARY:
// This is a complete React component you can drop into a small React project
// (created with Vite or Create React App). It provides:
// - Upload .xlsx or .csv files exported from Shopee
// - Select which columns to keep (the columns you listed are pre-mapped)
// - Automatically shows orders to ship TODAY and TOMORROW (based on "Data prevista de envio")
// - Shows daily sales, faturamento (Valor Total) and a filtered table
// - Quick export of the filtered view as CSV
// - Option to run locally (server) or deploy on GitHub Pages
//
// REQUIREMENTS / INSTALL
// 1) Create a React app (Vite recommended):
//    npm create vite@latest shopee-crm --template react
//    cd shopee-crm
// 2) Install dependencies:
//    npm install xlsx date-fns file-saver
// 3) Replace src/App.jsx with this file, and update src/main.jsx if needed.
// 4) Add Tailwind (optional) or use the included minimal styles.
// 5) Start dev server:
//    npm run dev
// 6) For GitHub Pages: build and push; you can use gh-pages or deploy via GitHub Actions.
//
// NOTES
// - Column names are in Portuguese and mapped to the user's provided list.
// - The component tries to be tolerant: if a column isn't present it still works.
// - Timezone: Uses the browser timezone (your machine). To force America/Sao_Paulo, set an environment/time conversion.

import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { parseISO, isSameDay, addDays, format } from 'date-fns';
import { saveAs } from 'file-saver';

export default function App(){
  const [rawRows, setRawRows] = useState([]); // array of original row objects
  const [selectedCols, setSelectedCols] = useState([
    'Data prevista de envio',
    'Nome do Produto',
    'Nome da variação',
    'Quantidade',
    'Número de produtos pedidos',
    'Nome de usuário (comprador)',
    'Nome do destinatário',
    'Observação do comprador',
    'Nota',
    'Valor Total',
    'ID do pedido'
  ]);
  const [availableCols, setAvailableCols] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [today, setToday] = useState(new Date());

  // parse uploaded file
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const ws = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
    setRawRows(json);
    setAvailableCols(Object.keys(json[0] || {}).sort());
  };

  // toggle column selections
  const toggleCol = (col) => {
    setSelectedCols(prev => prev.includes(col) ? prev.filter(c=>c!==col) : [...prev, col]);
  };

  // pick a date parser: attempt ISO then fallback to common dd/mm/yyyy
  const parseDate = (value) => {
    if(!value) return null;
    // If already a Date
    if(value instanceof Date) return value;
    // Try ISO
    try{
      const iso = parseISO(value);
      if(!isNaN(iso)) return iso;
    }catch(e){}
    // Try dd/mm/yyyy
    const m = value.toString().match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if(m){
      const day = parseInt(m[1],10);
      const month = parseInt(m[2],10)-1;
      const year = parseInt(m[3],10);
      return new Date(year, month, day);
    }
    // Last resort: Date constructor
    const d = new Date(value);
    return isNaN(d) ? null : d;
  }

  // derived filtered data (only selected columns)
  const filtered = useMemo(()=>{
    return rawRows.map(row=>{
      const out = {};
      selectedCols.forEach(col=> out[col]=row[col] ?? '');
      // keep originals for calculations
      out.__raw = row;
      // parse shipping date
      out.__shippingDate = parseDate(row['Data prevista de envio'] || row['Data prevista de envio ']);
      // parse total
      const total = row['Valor Total'] ?? row['Valor total'] ?? row['Total global'] ?? row['Valor Total '];
      // try to coerce number
      const num = typeof total === 'number' ? total : Number(String(total).replace(/[^0-9.,-]/g,'').replace(',','.'));
      out.__valorTotal = isNaN(num) ? 0 : num;
      // id
      out.__id = row['ID do pedido'] || row['ID do pedido '] || row['ID do pedido\r'] || '';
      return out;
    }).filter(r=>{
      if(!filterDate) return true;
      const d = parseDate(filterDate);
      if(!d) return true;
      if(!r.__shippingDate) return false;
      return isSameDay(d, r.__shippingDate);
    });
  },[rawRows, selectedCols, filterDate]);

  // summaries
  const summary = useMemo(()=>{
    const totalOrders = filtered.length;
    const faturamento = filtered.reduce((s,r)=>s + (Number(r.__valorTotal)||0), 0);
    // orders to ship today and tomorrow (based on shipping date)
    const todayDate = today;
    const tomorrowDate = addDays(todayDate,1);
    const toShipToday = filtered.filter(r=> r.__shippingDate && isSameDay(r.__shippingDate, todayDate));
    const toShipTomorrow = filtered.filter(r=> r.__shippingDate && isSameDay(r.__shippingDate, tomorrowDate));
    // group by day
    const byDay = {};
    filtered.forEach(r=>{
      const d = r.__shippingDate ? format(r.__shippingDate,'yyyy-MM-dd') : 'SEM DATA';
      if(!byDay[d]) byDay[d]= {orders:0, faturamento:0};
      byDay[d].orders += 1;
      byDay[d].faturamento += Number(r.__valorTotal)||0;
    });
    return { totalOrders, faturamento, toShipToday, toShipTomorrow, byDay };
  },[filtered, today]);

  const exportCSV = () =>{
    if(!filtered.length) return;
    const header = selectedCols;
    const rows = filtered.map(r=> header.map(h=> String(r[h] ?? '').replace(/\n/g,' ').replace(/,/g,';')));
    const csv = [header.join(','), ...rows.map(r=>r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'shopee-crm-export.csv');
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 font-sans">
      <div className="max-w-6xl mx-auto bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">CRM Shopee — Modelo B (React)</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block font-medium">Upload .xlsx ou .csv</label>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="mt-2 block" />
            <p className="text-sm text-gray-500 mt-2">Escolha a planilha exportada da Shopee.</p>
          </div>

          <div>
            <label className="block font-medium">Filtrar por Data prevista de envio (opcional)</label>
            <input type="date" value={filterDate} onChange={(e)=>setFilterDate(e.target.value)} className="mt-2 block p-2 border rounded" />
            <button onClick={()=>setFilterDate('')} className="mt-2 px-3 py-1 border rounded">Limpar data</button>
          </div>

          <div>
            <label className="block font-medium">Data "hoje" usada para filtros</label>
            <input type="date" value={format(today,'yyyy-MM-dd')} onChange={(e)=>setToday(parseDate(e.target.value))} className="mt-2 block p-2 border rounded" />
            <p className="text-sm text-gray-500 mt-2">Ajuste caso esteja usando o app num servidor com timezone diferente.</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-semibold">Colunas disponíveis</h2>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
            {availableCols.length===0 && <div className="text-sm text-gray-500">Faça upload da planilha para ver colunas.</div>}
            {availableCols.map(col=> (
              <label key={col} className="inline-flex items-center p-2 border rounded">
                <input type="checkbox" checked={selectedCols.includes(col)} onChange={()=>toggleCol(col)} />
                <span className="ml-2 text-sm">{col}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-600">Pedidos (lista atual)</div>
            <div className="text-2xl font-bold">{summary.totalOrders}</div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-600">Faturamento (soma Valor Total)</div>
            <div className="text-2xl font-bold">R$ {summary.faturamento.toFixed(2)}</div>
          </div>
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-600">Pedidos para enviar hoje</div>
            <div className="text-2xl font-bold">{summary.toShipToday.length}</div>
            <div className="text-xs text-gray-500 mt-2">Amostra: {summary.toShipToday.slice(0,3).map(r=> r.__id || r['Nome do Produto']).join(' — ')}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button onClick={exportCSV} className="px-4 py-2 bg-blue-600 text-white rounded">Exportar CSV (filtrado)</button>
          <button onClick={()=>{navigator.clipboard?.writeText(JSON.stringify(filtered.slice(0,100),null,2))}} className="px-4 py-2 border rounded">Copiar JSON (amostra)</button>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Pedidos para enviar — Hoje ({format(today,'yyyy-MM-dd')})</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left bg-gray-100">
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Produto</th>
                <th className="p-2 border">Variação</th>
                <th className="p-2 border">Quantidade</th>
                <th className="p-2 border">Comprador</th>
                <th className="p-2 border">Destinatário</th>
              </tr>
            </thead>
            <tbody>
              {summary.toShipToday.map(r=> (
                <tr key={r.__id + Math.random()}>
                  <td className="p-2 border">{r.__id}</td>
                  <td className="p-2 border">{r['Nome do Produto']}</td>
                  <td className="p-2 border">{r['Nome da variação']}</td>
                  <td className="p-2 border">{r['Quantidade'] || r['Número de produtos pedidos']}</td>
                  <td className="p-2 border">{r['Nome de usuário (comprador)']}</td>
                  <td className="p-2 border">{r['Nome do destinatário']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Pedidos para enviar — Amanhã ({format(addDays(today,1),'yyyy-MM-dd')})</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left bg-gray-100">
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Produto</th>
                <th className="p-2 border">Quantidade</th>
                <th className="p-2 border">Comprador</th>
              </tr>
            </thead>
            <tbody>
              {summary.toShipTomorrow.map(r=> (
                <tr key={r.__id + Math.random()}>
                  <td className="p-2 border">{r.__id}</td>
                  <td className="p-2 border">{r['Nome do Produto']}</td>
                  <td className="p-2 border">{r['Quantidade'] || r['Número de produtos pedidos']}</td>
                  <td className="p-2 border">{r['Nome de usuário (comprador)']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Tabela completa (filtrada)</h3>
          <div className="overflow-auto max-h-96 border rounded">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  {selectedCols.map((c)=> <th key={c} className="p-2 border">{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row,idx)=> (
                  <tr key={row.__id + idx} className={idx%2? 'bg-white':'bg-gray-50'}>
                    {selectedCols.map(col=> <td key={col} className="p-2 border">{row[col]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <footer className="max-w-6xl mx-auto text-sm text-gray-500 mt-4">Dica: se preferir rodar em servidor local sem deploy, você pode usar <code>npm run dev</code> e acessar via IP na sua rede interna.</footer>
    </div>
  );
}
