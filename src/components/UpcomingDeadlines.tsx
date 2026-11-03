import type { Task } from '../types/task';
import { loadCalendarEvents } from '../calendarStorage';
import { daysUntil, formatShortDate, relativeDue } from '../utils/dates';
import type { AppLanguage } from '../settings';
type Props = { tasks: Task[]; now: Date; language: AppLanguage };
type DeadlineItem = { id: string; title: string; dueDate: string; subject?: string };
export default function UpcomingDeadlines({ tasks, now, language }: Props) {
 const ru = language === 'ru';
 const taskItems: DeadlineItem[] = tasks.filter(t => t.status !== 'done').map(t => ({ id: 'task-' + t.id, title: t.title, dueDate: t.dueDate, subject: t.subject }));
 const calendarItems: DeadlineItem[] = loadCalendarEvents().filter(e => e.category === 'deadline' && !e.completed && !e.linkedTaskId).map(e => ({ id: 'calendar-' + e.id, title: e.title, dueDate: e.start.slice(0, 10), subject: e.subject }));
 const items = [...taskItems, ...calendarItems].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);
 return <section className="card" aria-labelledby="deadlines-heading"><h2 id="deadlines-heading">{ru ? 'Ближайшие дедлайны' : 'Upcoming deadlines'}</h2>
 {items.length === 0 ? <p className="empty small">{ru ? 'Нет ближайших дедлайнов.' : 'No upcoming deadlines.'}</p> : <ul className="deadlines">{items.map((t) => { const late = daysUntil(t.dueDate, now) < 0; return <li key={t.id} className="deadline"><div className={'deadline-date' + (late ? ' late' : '')}>{formatShortDate(t.dueDate, language)}</div><div><div className="deadline-title">{t.title}</div><div className={'deadline-rel' + (late ? ' late' : '')}>{relativeDue(t.dueDate, now, language)}{t.subject ? ' · ' + t.subject : ''}</div></div></li>; })}</ul>}
 </section>;
}
