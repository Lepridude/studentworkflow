import { useEffect, useState } from 'react';
import Sidebar, { type PageId } from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/Calendar';
import TasksPage from './pages/Tasks';
import { loadUserSettings, saveUserSettings, type UserSettings } from './settings';

export default function App() {
  const [page, setPage] = useState<PageId>('dashboard');
  const [now, setNow] = useState(() => new Date());
  const [settings, setSettings] = useState<UserSettings>(loadUserSettings);
  const [nameDraft, setNameDraft] = useState(settings.name);
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => { saveUserSettings(settings); }, [settings]);
  const ru = settings.language === 'ru';
  const titles: Record<Exclude<PageId, 'dashboard'>, string> = {
    tasks: ru ? 'Мои задачи' : 'My Tasks',
    calendar: ru ? 'Календарь' : 'Calendar',
    settings: ru ? 'Настройки' : 'Settings',
  };
  function saveName() {
    const name = nameDraft.trim();
    if (name) setSettings((old) => ({ ...old, name }));
    else setNameDraft(settings.name);
  }
  return (
    <div className="app">
      <Sidebar active={page} onNavigate={setPage} language={settings.language} />
      <div className="main">
        <Topbar now={now} userName={settings.name} language={settings.language} />
        <main className="content">
          {page === 'dashboard' ? (
            <Dashboard now={now} userName={settings.name} language={settings.language} />
          ) : page === 'tasks' ? (
            <TasksPage now={now} language={settings.language} />
          ) : page === 'calendar' ? (
            <CalendarPage now={now} language={settings.language} />
          ) : page === 'settings' ? (
            <div className="page">
              <div className="page-head">
                <h1>{titles.settings}</h1>
                <p className="muted">{ru ? 'Настройте профиль и язык интерфейса.' : 'Customize your profile and interface language.'}</p>
              </div>
              <section className="card">
                <h2>{ru ? 'Профиль' : 'Profile'}</h2>
                <label className="field">
                  <span>{ru ? 'Ваше имя' : 'Your name'}</span>
                  <input value={nameDraft} maxLength={40} onChange={(e) => setNameDraft(e.target.value)}
                    onBlur={saveName} onKeyDown={(e) => { if (e.key === 'Enter') saveName(); }}
                    placeholder={ru ? 'Введите имя' : 'Enter your name'} />
                </label>
                <label className="field">
                  <span>{ru ? 'Язык интерфейса' : 'Interface language'}</span>
                  <select value={settings.language} onChange={(e) => setSettings((old) => ({ ...old, language: e.target.value as UserSettings['language'] }))}>
                    <option value="ru">Русский</option><option value="en">English</option>
                  </select>
                </label>
                <p className="muted">{ru ? 'Настройки сохраняются автоматически в этом браузере.' : 'Settings are saved automatically in this browser.'}</p>
              </section>
            </div>
          ) : (
            <div className="page"><div className="page-head"><h1>{titles[page]}</h1>
              <p className="muted">{ru ? 'Этот раздел скоро появится.' : 'This section is coming soon.'}</p></div></div>
          )}
        </main>
      </div>
    </div>
  );
}
