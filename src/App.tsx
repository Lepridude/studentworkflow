import { useEffect, useLayoutEffect, useState, type ChangeEvent } from 'react';
import Sidebar, { type PageId } from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/Calendar';
import TasksPage from './pages/Tasks';
import SubjectsPage from './pages/Subjects';
import {
  loadUserSettings,
  saveUserSettings,
  type UserSettings,
} from './settings';

type AppProps = { email: string; onLogout: () => void; logoutBusy: boolean };

export default function App({ email, onLogout, logoutBusy }: AppProps) {
  const [page, setPage] = useState<PageId>('dashboard');
  const [now, setNow] = useState(() => new Date());
  const [settings, setSettings] = useState<UserSettings>(loadUserSettings);
  const [nameDraft, setNameDraft] = useState(settings.name);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    saveUserSettings(settings);
  }, [settings]);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.dataset.accent = settings.accent;
    document.documentElement.dataset.density = settings.density;
    document.documentElement.dataset.style = settings.style;
  }, [settings.theme, settings.accent, settings.density, settings.style]);

  const ru = settings.language === 'ru';

  const titles: Record<Exclude<PageId, 'dashboard'>, string> = {
    tasks: ru ? 'Мои задачи' : 'My Tasks',
    calendar: ru ? 'Календарь' : 'Calendar',
    subjects: ru ? 'Предметы' : 'Subjects',
    settings: ru ? 'Настройки' : 'Settings',
  };

  function saveName() {
    const name = nameDraft.trim();

    if (name) {
      setSettings((old) => ({ ...old, name }));
    } else {
      setNameDraft(settings.name);
    }
  }

  return (
    <div className={`app${settings.sidebarCollapsed ? " sidebar-is-collapsed" : ""}`}>
      <Sidebar
        active={page}
        onNavigate={setPage}
        language={settings.language}
        collapsed={settings.sidebarCollapsed}
        onToggleCollapsed={() => setSettings(old => ({ ...old, sidebarCollapsed: !old.sidebarCollapsed }))}
      />

      <div className="main">
        <Topbar
          now={now}
          userName={settings.name}
          avatarDataUrl={settings.avatarDataUrl}
          language={settings.language}
          onNavigate={setPage}
        />

        <main className="content">
          {page === 'dashboard' ? (
            <Dashboard
              now={now}
              userName={settings.name}
              language={settings.language}
            />
          ) : page === 'tasks' ? (
            <TasksPage now={now} language={settings.language} />
          ) : page === 'calendar' ? (
            <CalendarPage now={now} language={settings.language} />
          ) : page === 'subjects' ? (
            <SubjectsPage language={settings.language} />
          ) : page === 'settings' ? (
            <div className="page">
              <div className="page-head">
                <h1>{titles.settings}</h1>
                <p className="muted">
                  {ru ? 'Профиль, язык и внешний вид приложения.' : 'Profile, language and app appearance.'}
                </p>
              </div>

              <section className="card">
                <h2>{ru ? 'Профиль' : 'Profile'}</h2>

                <div className="profile-avatar-editor">
                  <div className="avatar avatar-preview">
                    {settings.avatarDataUrl ? <img src={settings.avatarDataUrl} alt={ru ? 'Аватар профиля' : 'Profile avatar'} /> : settings.name.trim().charAt(0).toUpperCase()}
                  </div>
                  <div className="profile-avatar-actions">
                    <label className="btn avatar-upload">
                      {ru ? 'Загрузить фото' : 'Upload photo'}
                      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={async (event: ChangeEvent<HTMLInputElement>) => {
                        const file = event.target.files?.[0];
                        event.target.value = '';
                        if (!file) return;
                        if (!file.type.startsWith('image/')) return;
                        if (file.size > 8 * 1024 * 1024) {
                          window.alert(ru ? 'Файл должен быть меньше 8 МБ.' : 'The file must be smaller than 8 MB.');
                          return;
                        }
                        try {
                          const source = await new Promise<string>((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Invalid image'));
                            reader.onerror = () => reject(new Error('Could not read image'));
                            reader.readAsDataURL(file);
                          });
                          const image = await new Promise<HTMLImageElement>((resolve, reject) => {
                            const element = new Image();
                            element.onload = () => resolve(element);
                            element.onerror = () => reject(new Error('Invalid image'));
                            element.src = source;
                          });
                          const canvas = document.createElement('canvas');
                          canvas.width = 256;
                          canvas.height = 256;
                          const context = canvas.getContext('2d');
                          if (!context) throw new Error('Canvas is unavailable');
                          const scale = Math.max(256 / image.width, 256 / image.height);
                          const width = image.width * scale;
                          const height = image.height * scale;
                          context.drawImage(image, (256 - width) / 2, (256 - height) / 2, width, height);
                          setSettings(old => ({ ...old, avatarDataUrl: canvas.toDataURL('image/jpeg', 0.82) }));
                        } catch {
                          window.alert(ru ? 'Не удалось загрузить изображение.' : 'Could not load the image.');
                        }
                      }} />
                    </label>
                    {settings.avatarDataUrl && <button type="button" className="btn" onClick={() => setSettings(old => ({ ...old, avatarDataUrl: null }))}>{ru ? 'Убрать фото' : 'Remove photo'}</button>}
                  </div>
                </div>

                <label className="field">
                  <span>{ru ? 'Email аккаунта' : 'Account email'}</span>
                  <input value={email} readOnly />
                </label>

                <label className="field">
                  <span>{ru ? 'Ваше имя' : 'Your name'}</span>
                  <input
                    value={nameDraft}
                    maxLength={40}
                    onChange={(e) => setNameDraft(e.target.value)}
                    onBlur={saveName}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveName();
                    }}
                    placeholder={ru ? 'Введите имя' : 'Enter your name'}
                  />
                </label>

                <label className="field">
                  <span>{ru ? 'Язык интерфейса' : 'Interface language'}</span>
                  <select
                    value={settings.language}
                    onChange={(e) =>
                      setSettings((old) => ({
                        ...old,
                        language: e.target.value as UserSettings['language'],
                      }))
                    }
                  >
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                  </select>
                </label>

                <label className="field">
                  <span>{ru ? 'Тема' : 'Theme'}</span>
                  <select
                    value={settings.theme}
                    onChange={(e) =>
                      setSettings((old) => ({
                        ...old,
                        theme: e.target.value as UserSettings['theme'],
                      }))
                    }
                  >
                    <option value="light">{ru ? 'Светлая' : 'Light'}</option>
                    <option value="dark">{ru ? 'Тёмная' : 'Dark'}</option>
                    <option value="supabase">{ru ? 'Supabase — графитовая' : 'Supabase — graphite'}</option>
                  </select>
                </label>

                <label className="field">
                  <span>{ru ? 'Акцентный цвет' : 'Accent color'}</span>
                  <select value={settings.accent} onChange={e => setSettings(old => ({ ...old, accent: e.target.value as UserSettings['accent'] }))}>
                    <option value="green">{ru ? 'Зелёный' : 'Green'}</option>
                    <option value="indigo">{ru ? 'Индиго' : 'Indigo'}</option>
                    <option value="blue">{ru ? 'Синий' : 'Blue'}</option>
                    <option value="orange">{ru ? 'Оранжевый' : 'Orange'}</option>
                  </select>
                </label>

                <label className="field">
                  <span>{ru ? 'Визуальный стиль' : 'Visual style'}</span>
                  <select value={settings.style} onChange={e => setSettings(old => ({ ...old, style: e.target.value as UserSettings['style'] }))}>
                    <option value="standard">{ru ? 'Стандартный — сбалансированный' : 'Standard — balanced'}</option>
                    <option value="supabase">{ru ? 'Supabase — строгий рабочий интерфейс' : 'Supabase — professional workspace'}</option>
                    <option value="minimal">{ru ? 'Минимализм — плоский и чистый' : 'Minimal — flat and clean'}</option>
                    <option value="soft">{ru ? 'Мягкий — округлые карточки' : 'Soft — rounded surfaces'}</option>
                  </select>
                </label>

                <label className="field">
                  <span>{ru ? 'Плотность интерфейса' : 'Interface density'}</span>
                  <select value={settings.density} onChange={e => setSettings(old => ({ ...old, density: e.target.value as UserSettings['density'] }))}>
                    <option value="comfortable">{ru ? 'Комфортная' : 'Comfortable'}</option>
                    <option value="compact">{ru ? 'Компактная' : 'Compact'}</option>
                  </select>
                </label>

                <label className="settings-toggle">
                  <input type="checkbox" checked={settings.sidebarCollapsed} onChange={e => setSettings(old => ({ ...old, sidebarCollapsed: e.target.checked }))} />
                  <span>{ru ? 'Сворачивать боковую панель' : 'Collapse sidebar'}</span>
                </label>

                <div className="settings-account-actions">
                  <p className="muted">{ru ? 'Изменения сохраняются автоматически.' : 'Changes are saved automatically.'}</p>
                  <button type="button" className="btn" onClick={onLogout} disabled={logoutBusy}>
                    {logoutBusy ? (ru ? 'Выход…' : 'Signing out…') : (ru ? 'Выйти из аккаунта' : 'Sign out')}
                  </button>
                </div>
              </section>
            </div>
          ) : (
            <div className="page">
              <div className="page-head">
                <h1>{titles[page]}</h1>
                <p className="muted">
                  {ru ? 'Раздел пока пуст.' : 'This section is empty.'}
                </p>
              </div>
            </div>
          )}
        </main>
        <footer className="site-footer">
          <span>© 2026 StudentFlow</span>
          <span>АРХАНГЕЛ сделал это вместе с CODEX</span>
        </footer>
      </div>
    </div>
  );
}
