import { useState, useEffect } from "react";
import { loadRecipes, saveRecipes } from "../services/recipeService";

export default function RecipeManager() {
  const [recipes, setRecipes] = useState({});
  const [produto, setProduto] = useState("");
  const [items, setItems] = useState("");

  useEffect(() => {
    setRecipes(loadRecipes());
  }, []);

  function save() {
    const updated = {
      ...recipes,
      [produto]: items.split("\n")
    };
    setRecipes(updated);
    saveRecipes(updated);
    setProduto("");
    setItems("");
  }

  return (
    <div>
      <h3>🧾 Receita Técnica</h3>

      <input
        placeholder="Nome do produto"
        value={produto}
        onChange={e => setProduto(e.target.value)}
      />

      <textarea
        placeholder="Ex:
2 papel fotográfico
50 folhas
1 wire-o"
        value={items}
        onChange={e => setItems(e.target.value)}
      />

      <button onClick={save}>Salvar Receita</button>

      <pre>{JSON.stringify(recipes, null, 2)}</pre>
    </div>
  );
}
