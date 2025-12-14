import { loadRecipes } from "../services/recipeService";
import { loadStock } from "../services/stockService";

export default function ProductMargin({ pedidos }) {
  const recipes = loadRecipes();
  const stock = loadStock();

  function rowStyle(pedido) {
  if (pedido.prioridade) return "#ffcccc"; // prioridade
  if (pedido.status === "pronto") return "#ccffcc"; // pronto
  if (pedido.status === "producao") return "#ffe5e5"; // produção
  return "white";
}

  function custoProduto(produto) {
    const receita = recipes[produto] || [];
    let total = 0;

    receita.forEach(l => {
      const [qtd, ...nomeArr] = l.split(" ");
      const nome = nomeArr.join(" ");
      const insumo = stock.find(s => s.nome === nome);
      if (insumo) total += qtd * insumo.custo;
    });

    return total;
  }

  const produtos = {};

  pedidos.forEach(p => {
    const nome = p["Nome do Produto"];
    if (!produtos[nome]) {
      produtos[nome] = {
        faturamento: 0,
        custo: 0
      };
    }

    produtos[nome].faturamento += Number(p["Valor Total"]);
    produtos[nome].custo += custoProduto(nome);
  });

  return (
    <div>
      <h3>📉 Margem por Produto</h3>
      <table>
        <thead>
          <tr style={{ background: rowStyle(pedido) }}>
            <th>Produto</th>
            <th>Faturamento</th>
            <th>Custo</th>
            <th>Lucro</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(produtos).map(([nome, v]) => (
            <tr key={nome}>
              <td>{nome}</td>
              <td>R$ {v.faturamento.toFixed(2)}</td>
              <td>R$ {v.custo.toFixed(2)}</td>
              <td
                style={{
                  color: v.faturamento - v.custo > 0 ? "green" : "red"
                }}
              >
                R$ {(v.faturamento - v.custo).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
