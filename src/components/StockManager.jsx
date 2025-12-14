import { useState, useEffect } from "react";
import { loadStock, saveStock } from "../services/stockService";

export default function StockManager() {
  const [stock, setStock] = useState([]);
  const [item, setItem] = useState({ nome: "", custo: "", unidade: "" });

  useEffect(() => {
    setStock(loadStock());
  }, []);

  function addItem() {
    const newStock = [...stock, item];
    setStock(newStock);
    saveStock(newStock);
    setItem({ nome: "", custo: "", unidade: "" });
  }

  return (
    <div>
      <h3>📦 Estoque</h3>

      <input
        placeholder="Insumo"
        value={item.nome}
        onChange={e => setItem({ ...item, nome: e.target.value })}
      />
      <input
        placeholder="Custo unitário"
        value={item.custo}
        onChange={e => setItem({ ...item, custo: e.target.value })}
      />
      <input
        placeholder="Unidade (cm, un, folha)"
        value={item.unidade}
        onChange={e => setItem({ ...item, unidade: e.target.value })}
      />
      <button onClick={addItem}>Adicionar</button>

      <ul>
        {stock.map((s, i) => (
          <li key={i}>
            {s.nome} — R$ {s.custo} / {s.unidade}
          </li>
        ))}
      </ul>
    </div>
  );
}
