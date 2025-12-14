import { addDays, format, isSaturday, isSunday } from "date-fns";

export function getNextBusinessDay(date) {
  let nextDay = addDays(date, 1);

  while (isSaturday(nextDay) || isSunday(nextDay)) {
    nextDay = addDays(nextDay, 1);
  }

  return nextDay;
}

export function getTodayAndNextBusinessDay() {
  const today = new Date();
  const nextBusinessDay = getNextBusinessDay(today);

  return {
    today: format(today, "yyyy-MM-dd"),
    nextBusinessDay: format(nextBusinessDay, "yyyy-MM-dd"),
  };
}
