import type { Task } from '../types/task';
import { loadCalendarEvents } from '../calendarStorage';
import { daysUntil, formatShortDate, relativeDue } from '../utils/dates';
import { effectiveDueDate } from '../utils/tasks';
import type { AppLanguage } from '../settings';

type Props = { tasks: Task[]; now: Date; language: AppLanguage };
type DeadlineItem = { id: string; title: string; dueDate: string; subject?: string };

export default function UpcomingDeadlines({ tasks, now, language }: Props) {
  const ru = language === 'ru';
  const taskItems: DeadlineItem[] = tasks
    .filter(task => task.status !== 'done')
    .map(task => ({
      id: 'task-' + task.id,
      title: task.title,
      dueDate: effectiveDueDate(task, now),
      subject: task.subject,
    }));

  const calendarItems: DeadlineItem[] = loadCalendarEvents()
    .filter(event => event.category === 'deadline' && !event.completed && !event.linkedTaskId)
    .map(event => ({
      id: 'calendar-' + event.id,
      title: event.title,
      dueDate: event.start.slice(0, 10),
      subject: event.subject,
    }));

  const items = [...taskItems, ...calendarItems]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  return (
    <section className="card" aria-labelledby="deadlines-heading">
      <h2 id="deadlines-heading">{ru ? 'Ближайшие дедлайны' : 'Upcoming deadlines'}</h2>
      {items.length === 0
        ? <p className="empty small">{ru ? 'Нет ближайших дедлайнов.' : 'No upcoming deadlines.'}</p>
        : <ul className="deadlines">
            {items.map(item => {
              const late = daysUntil(item.dueDate, now) < 0;
              return (
                <li key={item.id} className="deadline">
                  <div className={'deadline-date' + (late ? ' late' : '')}>{formatShortDate(item.dueDate, language)}</div>
                  <div>
                    <div className="deadline-title">{item.title}</div>
                    <div className={'deadline-rel' + (late ? ' late' : '')}>
                      {relativeDue(item.dueDate, now, language)}{item.subject ? ' · ' + item.subject : ''}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>}
    </section>
  );
}
