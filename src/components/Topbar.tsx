import Icon from './Icon';
import { formatLongDate } from '../utils/dates';
import type { AppLanguage } from '../settings';
type Props = { now: Date; userName: string; language: AppLanguage };
export default function Topbar({ now, userName, language }: Props) {
  return <header className="topbar">
    <div className="topbar-hello">
      <span className="topbar-welcome">{language === 'ru' ? `С возвращением, ${userName}` : `Welcome back, ${userName}`}</span>
      <span className="topbar-date">{formatLongDate(now, language)}</span>
    </div>
    <label className="search"><Icon name="search" size={18} />
      <input type="search" placeholder={language === 'ru' ? 'Поиск задач…' : 'Search tasks…'} aria-label={language === 'ru' ? 'Поиск задач' : 'Search tasks'} />
    </label>
    <div className="avatar" title={userName} aria-label={`Profile: ${userName}`}>{userName.charAt(0).toUpperCase()}</div>
  </header>;
}
