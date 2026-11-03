import Icon, { type IconName } from './Icon';
import type { Stats } from '../utils/tasks';

type Props = { stats: Stats };

export default function StatsGrid({ stats }: Props) {
  const cards: { key: string; label: string; value: number; icon: IconName; tone: string }[] = [
    { key: 'total', label: 'Total tasks', value: stats.total, icon: 'list', tone: 'blue' },
    { key: 'done', label: 'Completed', value: stats.done, icon: 'check', tone: 'green' },
    { key: 'progress', label: 'In progress', value: stats.inProgress, icon: 'clock', tone: 'amber' },
    { key: 'overdue', label: 'Overdue', value: stats.overdue, icon: 'alert', tone: 'red' },
  ];

  return (
    <section className="stats" aria-label="Statistics">
      {cards.map((c) => (
        <article key={c.key} className={`stat-card tone-${c.tone}`}>
          <span className="stat-icon">
            <Icon name={c.icon} />
          </span>
          <div>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        </article>
      ))}
    </section>
  );
}
