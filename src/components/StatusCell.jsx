export default function StatusCell({ value, onChange }) {
  const colors = {
    producao: "red",
    pronto: "green",
    prioridade: "darkred"
  };

  const labels = {
    producao: "🔴",
    pronto: "🟢",
    prioridade: "🚨"
  };

  function nextStatus() {
    if (value === "producao") return "pronto";
    if (value === "pronto") return "prioridade";
    return "producao";
  }

  return (
    <span
      onClick={() => onChange(nextStatus())}
      style={{
        cursor: "pointer",
        fontSize: 18,
        color: colors[value] || "red"
      }}
      title="Clique para mudar status"
    >
      {labels[value] || "🔴"}
    </span>
  );
}
