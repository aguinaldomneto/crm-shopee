export default function Dashboard({ pedidos }) {
  const totalPedidos = pedidos.length;
  const prontos = pedidos.filter(p => p.status === "pronto").length;
  const producao = pedidos.filter(p => p.status === "producao").length;
  const prioridade = pedidos.filter(p => p.prioridade).length;

  return (
    <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
      <Card titulo="Pedidos" valor={totalPedidos} />
      <Card titulo="Prontos" valor={prontos} cor="green" />
      <Card titulo="Em Produção" valor={producao} cor="red" />
      <Card titulo="Prioridade" valor={prioridade} cor="darkred" />
    </div>
  );
}

function Card({ titulo, valor, cor }) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: 8,
        background: "#f5f5f5",
        minWidth: 150,
        borderLeft: `6px solid ${cor || "#333"}`
      }}
    >
      <h4>{titulo}</h4>
      <strong style={{ fontSize: 22 }}>{valor}</strong>
    </div>
  );
}
