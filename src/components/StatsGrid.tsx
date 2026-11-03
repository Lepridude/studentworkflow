import Icon, { type IconName } from './Icon';
import type { Stats } from '../utils/tasks';
import type { AppLanguage } from '../settings';
type Props = { stats: Stats; language: AppLanguage };
export default function StatsGrid({ stats, language }: Props) {
  const ru = language === 'ru';
  const cards: { key: string; label: string; value: number; icon: IconName; tone: string }[] = [
    { key: 'total', label: ru ? 'Всего задач' : 'Total tasks', value: stats.total, icon: 'list', tone: 'blue' },
    { key: 'done', label: ru ? 'Выполнено' : 'Completed', value: stats.done, icon: 'check', tone: 'green' },
    { key: 'progress', label: ru ? 'В процессе' : 'In progress', value: stats.inProgress, icon: 'clock', tone: 'amber' },
    { key: 'overdue', label: ru ? 'Просрочено' : 'Overdue', value: stats.overdue, icon: 'alert', tone: 'red' },
  ];
  return <section className="stats" aria-label={ru ? 'Статистика' : 'Statistics'}>{cards.map((c) => <article key={c.key} className={'stat-card tone-' + c.tone}><span className="stat-icon"><Icon name={c.icon} /></span><div><div className="stat-value">{c.value}</div><div className="stat-label">{c.label}</div></div></article>)}</section>;
}
