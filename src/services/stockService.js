const STOCK_KEY = "crm_shopee_stock";

export function loadStock() {
  return JSON.parse(localStorage.getItem(STOCK_KEY)) || [];
}

export function saveStock(stock) {
  localStorage.setItem(STOCK_KEY, JSON.stringify(stock));
}
