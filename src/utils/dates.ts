const pad = (n: number) => String(n).padStart(2, '0');
export function toISODate(d: Date): string { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
export function todayISO(now: Date = new Date()): string { return toISODate(now); }
export function offsetDate(days: number, now: Date = new Date()): string { return toISODate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + days)); }
function parseISO(iso: string): Date { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); }
export function daysUntil(iso: string, now: Date = new Date()): number { return Math.round((parseISO(iso).getTime() - parseISO(todayISO(now)).getTime()) / 86400000); }
export function greetingFor(now: Date = new Date()): string { const h = now.getHours(); if (h >= 5 && h < 12) return 'Good morning'; if (h >= 12 && h < 18) return 'Good afternoon'; if (h >= 18 && h < 23) return 'Good evening'; return 'Good night'; }
export function formatLongDate(now: Date = new Date(), language: 'ru' | 'en' = 'en'): string { return now.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' }); }
export function formatShortDate(iso: string, language: 'ru' | 'en' = 'en'): string { return parseISO(iso).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { month: 'short', day: 'numeric' }); }
export function relativeDue(iso: string, now: Date = new Date(), language: 'ru' | 'en' = 'en'): string { const diff = daysUntil(iso, now); if (language === 'ru') { if (diff === 0) return 'Сегодня'; if (diff === 1) return 'Завтра'; if (diff === -1) return 'Вчера'; if (diff > 1) return 'Через ' + diff + ' дн.'; return Math.abs(diff) + ' дн. назад'; } if (diff === 0) return 'Today'; if (diff === 1) return 'Tomorrow'; if (diff === -1) return 'Yesterday'; if (diff > 1) return 'In ' + diff + ' days'; return Math.abs(diff) + ' days ago'; }
