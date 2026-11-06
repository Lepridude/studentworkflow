import Icon, { type IconName } from './Icon';
import type { AppLanguage } from '../settings';
export type PageId = 'dashboard' | 'tasks' | 'calendar' | 'subjects' | 'settings';
const ITEMS: { id: PageId; icon: IconName }[] = [
  { id: 'dashboard', icon: 'dashboard' }, { id: 'tasks', icon: 'tasks' },
  { id: 'calendar', icon: 'calendar' }, { id: 'subjects', icon: 'list' }, { id: 'settings', icon: 'settings' },
];
type Props = { active: PageId; onNavigate: (page: PageId) => void; language: AppLanguage; collapsed: boolean; onToggleCollapsed: () => void };
export default function Sidebar({ active, onNavigate, language, collapsed, onToggleCollapsed }: Props) {
  const labels: Record<PageId, string> = language === 'ru'
    ? { dashboard: 'Главная', tasks: 'Мои задачи', calendar: 'Календарь', subjects: 'Предметы', settings: 'Настройки' }
    : { dashboard: 'Dashboard', tasks: 'My Tasks', calendar: 'Calendar', subjects: 'Subjects', settings: 'Settings' };
  return <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
    <button type="button" className="sidebar-collapse" onClick={onToggleCollapsed} aria-label={collapsed ? (language === "ru" ? "Развернуть меню" : "Expand menu") : (language === "ru" ? "Свернуть меню" : "Collapse menu")} title={collapsed ? "Expand" : "Collapse"}>{collapsed ? "›" : "‹"}</button>
    <div className="logo"><span className="logo-mark"><Icon name="logo" size={22} /></span><span className="logo-text">StudentFlow</span></div>
    <nav className="nav" aria-label={language === 'ru' ? 'Основная навигация' : 'Main navigation'}>
      {ITEMS.map((item) => <button key={item.id} type="button"
        className={`nav-item${active === item.id ? ' active' : ''}`}
        title={labels[item.id]}
        aria-label={labels[item.id]}
        aria-current={active === item.id ? 'page' : undefined} onClick={() => onNavigate(item.id)}>
        <Icon name={item.icon} /><span className="nav-label">{labels[item.id]}</span>
      </button>)}
    </nav>
  </aside>;
}
