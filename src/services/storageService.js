const STORAGE_KEY = "crm_shopee_daily_data";

export function saveDailyData(data) {
  const payload = {
    date: new Date().toISOString().slice(0, 10),
    expiresAt: new Date().setHours(23, 59, 59, 999),
    data,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function loadDailyData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  const parsed = JSON.parse(raw);

  if (Date.now() > parsed.expiresAt) {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }

  return parsed.data;
}

export function exportDailyJSON(data) {
  const blob = new Blob(
    [JSON.stringify({ date: new Date().toISOString(), pedidos: data }, null, 2)],
    { type: "application/json" }
  );

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `pedidos-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
}
