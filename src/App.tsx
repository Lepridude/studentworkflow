import { useEffect, useState } from 'react';
import Sidebar, { type PageId } from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';

const USER_NAME = 'Alex';

const TITLES: Record<Exclude<PageId, 'dashboard'>, string> = {
  tasks: 'My Tasks',
  calendar: 'Calendar',
  settings: 'Settings',
};

export default function App() {
  const [page, setPage] = useState<PageId>('dashboard');
  const [now, setNow] = useState(() => new Date());

  // Обновляем «сейчас» раз в минуту: приветствие и просрочка остаются актуальными.
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="app">
      <Sidebar active={page} onNavigate={setPage} />
      <div className="main">
        <Topbar now={now} userName={USER_NAME} />
        <main className="content">
          {page === 'dashboard' ? (
            <Dashboard now={now} userName={USER_NAME} />
          ) : (
            <div className="page">
              <div className="page-head">
                <h1>{TITLES[page]}</h1>
                <p className="muted">This section is coming soon.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
