export default function ProductionSummary({ pedidos }) {
  const resumo = {};

  pedidos.forEach(p => {
    const produto = p["Nome do Produto"];
    const variacao = p["Nome da variação"] || "Padrão";
    const qtd = Number(p["Quantidade"] || p["Número de produtos pedidos"] || 1);

    if (!resumo[produto]) resumo[produto] = { total: 0, variacoes: {} };

    resumo[produto].total += qtd;
    resumo[produto].variacoes[variacao] =
      (resumo[produto].variacoes[variacao] || 0) + qtd;
  });

  return (
    <div style={{ marginBottom: 20 }}>
      <h3>📦 Resumo de Produção</h3>

      {Object.entries(resumo).map(([produto, info]) => (
        <div key={produto}>
          <strong>{produto}: {info.total}</strong>
          <ul>
            {Object.entries(info.variacoes).map(([v, q]) => (
              <li key={v}>{v}: {q}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
