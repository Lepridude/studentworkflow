export type AppLanguage = 'ru' | 'en';
export type AppTheme = 'light' | 'dark';
export type UserSettings = { name: string; language: AppLanguage; theme: AppTheme };

const KEY = 'studentworkflow.settings.v1';
const DEFAULT_SETTINGS: UserSettings = { name: 'Alex', language: 'en', theme: 'light' };

export function loadUserSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;

    const value: unknown = JSON.parse(raw);
    if (value && typeof value === 'object') {
      const candidate = value as Partial<UserSettings>;

      return {
        name: typeof candidate.name === 'string' ? candidate.name : DEFAULT_SETTINGS.name,
        language:
          candidate.language === 'ru' || candidate.language === 'en'
            ? candidate.language
            : DEFAULT_SETTINGS.language,
        theme:
          candidate.theme === 'dark' || candidate.theme === 'light'
            ? candidate.theme
            : DEFAULT_SETTINGS.theme,
      };
    }
  } catch {
    // Keep the app usable if localStorage contains invalid data or is unavailable.
  }

  return DEFAULT_SETTINGS;
}

export function saveUserSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // The current session remains usable without persistent settings.
  }
}
