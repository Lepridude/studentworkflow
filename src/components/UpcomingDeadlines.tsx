import type { Task } from '../types/task';
import { upcomingDeadlines } from '../utils/tasks';
import { daysUntil, formatShortDate, relativeDue } from '../utils/dates';
import type { AppLanguage } from '../settings';
type Props = { tasks: Task[]; now: Date; language: AppLanguage };
export default function UpcomingDeadlines({ tasks, now, language }: Props) {
 const items = upcomingDeadlines(tasks); const ru = language === 'ru';
 return <section className="card" aria-labelledby="deadlines-heading"><h2 id="deadlines-heading">{ru ? 'Ближайшие дедлайны' : 'Upcoming deadlines'}</h2>
 {items.length === 0 ? <p className="empty small">{ru ? 'Нет ближайших дедлайнов.' : 'No upcoming deadlines.'}</p> : <ul className="deadlines">{items.map((t) => { const late = daysUntil(t.dueDate, now) < 0; return <li key={t.id} className="deadline"><div className={'deadline-date' + (late ? ' late' : '')}>{formatShortDate(t.dueDate, language)}</div><div><div className="deadline-title">{t.title}</div><div className={'deadline-rel' + (late ? ' late' : '')}>{relativeDue(t.dueDate, now, language)}</div></div></li>; })}</ul>}
 </section>;
}
