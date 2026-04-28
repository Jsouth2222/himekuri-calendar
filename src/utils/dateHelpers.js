const WEEKDAYS_JA = ['日', '月', '火', '水', '木', '金', '土'];
const WEEKDAYS_FULL_JA = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
const MONTHS_JA = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export function getWeekdayShort(date) {
  return WEEKDAYS_JA[date.getDay()];
}

export function getWeekdayFull(date) {
  return WEEKDAYS_FULL_JA[date.getDay()];
}

export function getMonth(date) {
  return MONTHS_JA[date.getMonth()];
}

export function getDay(date) {
  return date.getDate();
}

export function getYear(date) {
  return date.getFullYear();
}

export function isToday(date) {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function isSaturday(date) {
  return date.getDay() === 6;
}

export function isSunday(date) {
  return date.getDay() === 0;
}

export function formatTime(dateString) {
  if (!dateString) return '';
  // All-day events have only a date string (YYYY-MM-DD)
  if (dateString.length === 10) return '終日';
  const d = new Date(dateString);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function formatTimeRange(start, end) {
  const s = formatTime(start?.dateTime || start?.date);
  if (s === '終日') return '終日';
  const e = formatTime(end?.dateTime || end?.date);
  return `${s} – ${e}`;
}

export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
