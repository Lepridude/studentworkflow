export type AppLanguage = 'ru' | 'en';
export type AppTheme = 'light' | 'dark' | 'supabase';
export type AppAccent = 'green' | 'indigo' | 'blue' | 'orange';
export type AppDensity = 'comfortable' | 'compact';
export type AppStyle = 'standard' | 'supabase' | 'minimal' | 'soft';
export type UserSettings = {
  name: string;
  language: AppLanguage;
  theme: AppTheme;
  accent: AppAccent;
  density: AppDensity;
  style: AppStyle;
  sidebarCollapsed: boolean;
  avatarDataUrl: string | null;
};

const KEY = 'studentworkflow.settings.v1';
const DEFAULT_SETTINGS: UserSettings = {
  name: 'Alex', language: 'en', theme: 'light',
  accent: 'green', density: 'comfortable', style: 'standard', sidebarCollapsed: false, avatarDataUrl: null,
};

export function loadUserSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const value: unknown = JSON.parse(raw);
    if (value && typeof value === 'object') {
      const candidate = value as Partial<UserSettings>;
      return {
        name: typeof candidate.name === 'string' ? candidate.name : DEFAULT_SETTINGS.name,
        language: candidate.language === 'ru' || candidate.language === 'en' ? candidate.language : DEFAULT_SETTINGS.language,
        theme: candidate.theme === 'dark' || candidate.theme === 'supabase' || candidate.theme === 'light' ? candidate.theme : DEFAULT_SETTINGS.theme,
        accent: candidate.accent === 'green' || candidate.accent === 'indigo' || candidate.accent === 'blue' || candidate.accent === 'orange' ? candidate.accent : DEFAULT_SETTINGS.accent,
        density: candidate.density === 'compact' || candidate.density === 'comfortable' ? candidate.density : DEFAULT_SETTINGS.density,
        style: candidate.style === 'supabase' || candidate.style === 'minimal' || candidate.style === 'soft' || candidate.style === 'standard' ? candidate.style : DEFAULT_SETTINGS.style,
        sidebarCollapsed: typeof candidate.sidebarCollapsed === 'boolean' ? candidate.sidebarCollapsed : DEFAULT_SETTINGS.sidebarCollapsed,
        avatarDataUrl: typeof candidate.avatarDataUrl === 'string' && candidate.avatarDataUrl.startsWith('data:image/') ? candidate.avatarDataUrl : null,
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
    window.dispatchEvent(new Event('studentflow:data-changed'));
  } catch {
    // The current session remains usable without persistent settings.
  }
}
