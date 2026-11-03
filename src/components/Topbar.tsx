import Icon from './Icon';
import { formatLongDate } from '../utils/dates';

type Props = {
  now: Date;
  userName: string;
};

export default function Topbar({ now, userName }: Props) {
  return (
    <header className="topbar">
      <div className="topbar-hello">
        <span className="topbar-welcome">Welcome back, {userName}</span>
        <span className="topbar-date">{formatLongDate(now)}</span>
      </div>
      <label className="search">
        <Icon name="search" size={18} />
        <input type="search" placeholder="Search tasks…" aria-label="Search tasks" />
      </label>
      <div className="avatar" title={userName} aria-label={`Profile: ${userName}`}>
        {userName.charAt(0).toUpperCase()}
      </div>
    </header>
  );
}
