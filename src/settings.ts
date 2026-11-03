export type AppLanguage = 'ru' | 'en';
export type UserSettings = { name: string; language: AppLanguage };
const KEY = 'studentworkflow.settings.v1';
const DEFAULT_SETTINGS: UserSettings = { name: 'Alex', language: 'en' };
export function loadUserSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const value: unknown = JSON.parse(raw);
    if (value && typeof value === 'object') {
      const candidate = value as Partial<UserSettings>;
      return { name: typeof candidate.name === 'string' ? candidate.name : DEFAULT_SETTINGS.name, language: candidate.language === 'ru' || candidate.language === 'en' ? candidate.language : DEFAULT_SETTINGS.language };
    }
  } catch { /* Use defaults if storage is unavailable or invalid. */ }
  return DEFAULT_SETTINGS;
}
export function saveUserSettings(settings: UserSettings): void {
  try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* Current session remains usable. */ }
}
