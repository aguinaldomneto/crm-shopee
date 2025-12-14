const STATUS_KEY = "crm_shopee_status";

export function loadStatus() {
  return JSON.parse(localStorage.getItem(STATUS_KEY)) || {};
}

export function saveStatus(statusMap) {
  localStorage.setItem(STATUS_KEY, JSON.stringify(statusMap));
}
