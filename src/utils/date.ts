const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'] as const;

export function pad2(value: number | string): string {
  return String(value).padStart(2, '0');
}

export function toYearMonth(year: number, month: number): string {
  return `${year}-${pad2(month)}`;
}

export function toYmd(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function toDotYmd(year: number, month: number, day: number): string {
  return `${year}.${pad2(month)}.${pad2(day)}`;
}

export function formatYearMonthKorean(year: number, month: number): string {
  return `${year}년 ${month}월`;
}

export function formatYearMonthKoreanFromYm(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return formatYearMonthKorean(Number(year), Number(month));
}

export function formatMonthKoreanFromYm(yearMonth: string): string {
  const [, month] = yearMonth.split('-');
  return `${Number(month)}월`;
}

export function formatDateOnly(isoDate: string): string {
  return isoDate.slice(0, 10);
}

export function formatTimeHHMM(isoDateTime: string): string {
  const d = new Date(isoDateTime);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function formatDateWithDay(isoDateTime: string): string {
  const d = new Date(isoDateTime);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dayName = DAY_NAMES[d.getDay()];
  return `${y}. ${m}. ${day} (${dayName})`;
}

export function formatDateKoreanWithUntil(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}년 ${month}월 ${day}일까지`;
}

export function formatDateDotSeparated(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year} . ${month} . ${day}`;
}

export function getDaysRemaining(expiredAt: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiredAt);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
