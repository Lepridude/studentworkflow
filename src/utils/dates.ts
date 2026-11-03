const pad = (n: number) => String(n).padStart(2, '0');

/** Дата в формате YYYY-MM-DD по локальному времени. */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO(now: Date = new Date()): string {
  return toISODate(now);
}

/** Сдвиг от сегодняшнего дня на n дней (можно отрицательное). */
export function offsetDate(days: number, now: Date = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
  return toISODate(d);
}

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Сколько дней от сегодня до даты (отрицательное — уже прошло). */
export function daysUntil(iso: string, now: Date = new Date()): number {
  const a = parseISO(iso).getTime();
  const b = parseISO(todayISO(now)).getTime();
  return Math.round((a - b) / 86_400_000);
}

export function greetingFor(now: Date = new Date()): string {
  const h = now.getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 18) return 'Good afternoon';
  if (h >= 18 && h < 23) return 'Good evening';
  return 'Good night';
}

export function formatLongDate(now: Date = new Date()): string {
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatShortDate(iso: string): string {
  return parseISO(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/** Человекочитаемый срок: «Today», «Tomorrow», «In 3 days», «2 days ago». */
export function relativeDue(iso: string, now: Date = new Date()): string {
  const diff = daysUntil(iso, now);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1) return `In ${diff} days`;
  return `${Math.abs(diff)} days ago`;
}
