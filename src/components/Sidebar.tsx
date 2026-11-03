import Icon, { type IconName } from './Icon';
import type { AppLanguage } from '../settings';
export type PageId = 'dashboard' | 'tasks' | 'calendar' | 'settings';
const ITEMS: { id: PageId; icon: IconName }[] = [
  { id: 'dashboard', icon: 'dashboard' }, { id: 'tasks', icon: 'tasks' },
  { id: 'calendar', icon: 'calendar' }, { id: 'settings', icon: 'settings' },
];
type Props = { active: PageId; onNavigate: (page: PageId) => void; language: AppLanguage };
export default function Sidebar({ active, onNavigate, language }: Props) {
  const labels: Record<PageId, string> = language === 'ru'
    ? { dashboard: 'Главная', tasks: 'Мои задачи', calendar: 'Календарь', settings: 'Настройки' }
    : { dashboard: 'Dashboard', tasks: 'My Tasks', calendar: 'Calendar', settings: 'Settings' };
  return <aside className="sidebar">
    <div className="logo"><span className="logo-mark"><Icon name="logo" size={22} /></span><span className="logo-text">StudentFlow</span></div>
    <nav className="nav" aria-label={language === 'ru' ? 'Основная навигация' : 'Main navigation'}>
      {ITEMS.map((item) => <button key={item.id} type="button"
        className={`nav-item${active === item.id ? ' active' : ''}`}
        aria-current={active === item.id ? 'page' : undefined} onClick={() => onNavigate(item.id)}>
        <Icon name={item.icon} /><span className="nav-label">{labels[item.id]}</span>
      </button>)}
    </nav>
  </aside>;
}
