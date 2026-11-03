import Icon, { type IconName } from './Icon';

export type PageId = 'dashboard' | 'tasks' | 'calendar' | 'settings';

const ITEMS: { id: PageId; label: string; icon: IconName }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'tasks', label: 'My Tasks', icon: 'tasks' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

type Props = {
  active: PageId;
  onNavigate: (page: PageId) => void;
};

export default function Sidebar({ active, onNavigate }: Props) {
  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="logo-mark">
          <Icon name="logo" size={22} />
        </span>
        <span className="logo-text">StudyFlow</span>
      </div>
      <nav className="nav" aria-label="Main navigation">
        {ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item${active === item.id ? ' active' : ''}`}
            aria-current={active === item.id ? 'page' : undefined}
            onClick={() => onNavigate(item.id)}
          >
            <Icon name={item.icon} />
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
