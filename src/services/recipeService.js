const RECIPE_KEY = "crm_shopee_recipes";

export function loadRecipes() {
  return JSON.parse(localStorage.getItem(RECIPE_KEY)) || {};
}

export function saveRecipes(recipes) {
  localStorage.setItem(RECIPE_KEY, JSON.stringify(recipes));
}
