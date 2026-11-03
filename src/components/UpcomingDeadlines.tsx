import type { Task } from '../types/task';
import { upcomingDeadlines } from '../utils/tasks';
import { daysUntil, formatShortDate, relativeDue } from '../utils/dates';

type Props = { tasks: Task[]; now: Date };

export default function UpcomingDeadlines({ tasks, now }: Props) {
  const items = upcomingDeadlines(tasks);

  return (
    <section className="card" aria-labelledby="deadlines-heading">
      <h2 id="deadlines-heading">Upcoming deadlines</h2>
      {items.length === 0 ? (
        <p className="empty small">No upcoming deadlines.</p>
      ) : (
        <ul className="deadlines">
          {items.map((t) => {
            const late = daysUntil(t.dueDate, now) < 0;
            return (
              <li key={t.id} className="deadline">
                <div className={`deadline-date${late ? ' late' : ''}`}>
                  {formatShortDate(t.dueDate)}
                </div>
                <div>
                  <div className="deadline-title">{t.title}</div>
                  <div className={`deadline-rel${late ? ' late' : ''}`}>
                    {relativeDue(t.dueDate, now)}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
