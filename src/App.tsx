import { useEffect, useLayoutEffect, useState } from 'react';
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

export default function App() {
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
  }, [settings.theme, settings.accent, settings.density]);

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
    <div className="app">
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

                <p className="muted">
                  {ru
                    ? 'Изменения сохраняются автоматически.'
                    : 'Changes are saved automatically.'}
                </p>
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
      </div>
    </div>
  );
}
