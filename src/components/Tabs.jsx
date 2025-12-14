export default function Tabs({ active, onChange }) {
  const tabs = ["Produção", "Estoque", "Financeiro"];

  return (
    <div style={{ marginBottom: 20 }}>
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          style={{
            marginRight: 10,
            padding: "6px 12px",
            background: active === tab ? "#333" : "#eee",
            color: active === tab ? "#fff" : "#000",
            border: "none",
            cursor: "pointer"
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
