import StockManager from "./components/StockManager";
import RecipeManager from "./components/RecipeManager";
import FinanceView from "./components/FinanceView";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { getTodayAndNextBusinessDay } from "./services/dateUtils";
import {
  saveDailyData,
  loadDailyData,
  exportDailyJSON
} from "./services/storageService";
import { loadStatus, saveStatus } from "./services/statusService";
import ProductionSummary from "./components/ProductionSummary";
import StatusCell from "./components/StatusCell";
import Tabs from "./components/Tabs";

function App() {
  const [pedidos, setPedidos] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [tab, setTab] = useState("Produção");

  useEffect(() => {
    const cached = loadDailyData();
    if (cached) setPedidos(cached);
    setStatusMap(loadStatus());
  }, []);

  function handleFileUpload(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = evt => {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);

      saveDailyData(data);
      setPedidos(data);
    };

    reader.readAsBinaryString(file);
  }

  function pedidosDoDia() {
    const { today, nextBusinessDay } = getTodayAndNextBusinessDay();

    return pedidos.filter(
      p =>
        p["Data prevista de envio"] === today ||
        p["Data prevista de envio"] === nextBusinessDay
    );
  }

  function updateStatus(index, value) {
    const newMap = { ...statusMap, [index]: value };
    setStatusMap(newMap);
    saveStatus(newMap);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>CRM Shopee</h2>

      <Tabs active={tab} onChange={setTab} />

      {tab === "Produção" && (
        <>
          <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
          <button onClick={() => setTab("Dashboard")}>Dashboard</button>
          <button onClick={() => exportDailyJSON(pedidos)}>
            ☁️ Exportar JSON do Dia
          </button>

          <ProductionSummary pedidos={pedidosDoDia()} />

          <table border="1" cellPadding="5">
            <thead>
              <tr>
                <th>Status</th>
                <th>Produto</th>
                <th>Variação</th>
                <th>Quantidade</th>
                <th>Cliente</th>
              </tr>
            </thead>
            <tbody>
              {pedidosDoDia().map((p, i) => (
                <tr key={i}>
                  <td>
                    <StatusCell
                      value={statusMap[i] || "producao"}
                      onChange={v => updateStatus(i, v)}
                    />
                  </td>
                  <td>{p["Nome do Produto"]}</td>
                  <td>{p["Nome da variação"]}</td>
                  <td>{p["Quantidade"] || p["Número de produtos pedidos"]}</td>
                  <td>{p["Nome do destinatário"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

{tab === "Estoque" && (
  <>
    <StockManager />
    <RecipeManager />
  </>
)}

{tab === "Dashboard" && (
  <>
    <Dashboard pedidos={pedidosDoDia()} />
    <ProductMargin pedidos={pedidosDoDia()} />
  </>
)}

{tab === "Financeiro" && (
  <FinanceView pedidos={pedidosDoDia()} />
)}

    </div>
  );
}

export default App;
