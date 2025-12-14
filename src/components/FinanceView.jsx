import { loadStock } from "../services/stockService";
import { loadRecipes } from "../services/recipeService";

export default function FinanceView({ pedidos }) {
  const stock = loadStock();
  const recipes = loadRecipes();

  function custoProduto(produto) {
    const receita = recipes[produto] || [];
    let total = 0;

    receita.forEach(linha => {
      const [qtd, ...nomeArr] = linha.split(" ");
      const nome = nomeArr.join(" ");
      const insumo = stock.find(s => s.nome === nome);

      if (insumo) {
        total += Number(qtd) * Number(insumo.custo);
      }
    });

    return total;
  }

  const faturamento = pedidos.reduce(
    (sum, p) => sum + Number(p["Valor Total"] || 0),
    0
  );

  const custo = pedidos.reduce(
    (sum, p) => sum + custoProduto(p["Nome do Produto"]),
    0
  );

  return (
    <div>
      <h3>💰 Financeiro</h3>
      <p>Faturamento: R$ {faturamento.toFixed(2)}</p>
      <p>Custo produção: R$ {custo.toFixed(2)}</p>
      <p>
        <strong>Lucro: R$ {(faturamento - custo).toFixed(2)}</strong>
      </p>
    </div>
  );
}
