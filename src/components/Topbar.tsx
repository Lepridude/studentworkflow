import { useMemo, useState } from 'react';
import Icon from './Icon';
import { formatLongDate } from '../utils/dates';
import type { AppLanguage } from '../settings';
import type { PageId } from './Sidebar';
import { loadTasks } from '../storage';
import { loadCalendarEvents } from '../calendarStorage';

type Props = { now: Date; userName: string; language: AppLanguage; onNavigate: (page: PageId) => void };
type SearchResult = { id: string; title: string; detail: string; page: PageId; kind: 'task' | 'event' };

export default function Topbar({ now, userName, language, onNavigate }: Props) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const ru = language === 'ru';
  const results = useMemo<SearchResult[]>(() => {
    const normalized = query.trim().toLocaleLowerCase(language === 'ru' ? 'ru-RU' : 'en-US');
    if (!normalized) return [];
    const tasks: SearchResult[] = loadTasks().map(task => ({
      id: task.id, title: task.title,
      detail: [task.subject, task.dueDate, ru ? 'Задача' : 'Task'].filter(Boolean).join(' · '),
      page: 'tasks', kind: 'task'
    }));
    const events: SearchResult[] = loadCalendarEvents().map(event => ({
      id: event.id, title: event.title,
      detail: [event.subject, new Date(event.start).toLocaleString(ru ? 'ru-RU' : 'en-US'), ru ? 'Событие' : 'Event'].filter(Boolean).join(' · '),
      page: 'calendar', kind: 'event'
    }));
    return [...tasks, ...events].filter(item => item.title.toLocaleLowerCase().includes(normalized)
      || item.detail.toLocaleLowerCase().includes(normalized)).slice(0, 8);
  }, [query, language, ru]);
  function openResult(result: SearchResult) {
    onNavigate(result.page);
    setQuery('');
    setFocused(false);
  }
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') { setQuery(''); setFocused(false); }
    if (event.key === 'Enter' && results[0]) openResult(results[0]);
  }
  return <header className="topbar">
    <div className="topbar-hello">
      <span className="topbar-welcome">{ru ? `С возвращением, ${userName}` : `Welcome back, ${userName}`}</span>
      <span className="topbar-date">{formatLongDate(now, language)}</span>
    </div>
    <div className="search-wrap">
      <label className="search">
        <Icon name="search" size={18} />
        <input type="search" value={query} onChange={event => setQuery(event.target.value)}
          onFocus={() => setFocused(true)} onKeyDown={handleKeyDown}
          placeholder={ru ? 'Поиск задач и событий…' : 'Search tasks and events…'}
          aria-label={ru ? 'Поиск задач и событий' : 'Search tasks and events'} aria-expanded={focused && query.trim().length > 0}
          aria-controls="global-search-results" />
        {query && <button type="button" className="search-clear" onClick={() => setQuery('')} aria-label={ru ? 'Очистить поиск' : 'Clear search'}>×</button>}
      </label>
      {focused && query.trim() && <div className="search-results" id="global-search-results" role="listbox">
        {results.length ? results.map(result => <button type="button" role="option" key={result.kind + result.id}
          className="search-result" onMouseDown={event => event.preventDefault()} onClick={() => openResult(result)}>
          <span className="search-result-icon">{result.kind === 'task' ? '✓' : '▦'}</span>
          <span className="search-result-text"><strong>{result.title}</strong><small>{result.detail}</small></span>
        </button>) : <p className="search-empty">{ru ? 'Ничего не найдено' : 'No results found'}</p>}
      </div>}
    </div>
    <div className="avatar" title={userName} aria-label={`Profile: ${userName}`}>{userName.charAt(0).toUpperCase()}</div>
  </header>;
}
