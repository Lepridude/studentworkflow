import { PriorityBadge } from './Badges';
import type { Priority } from '../types/task';
import type { AppLanguage } from '../settings';
export default function PriorityGuide({ language }: { language: AppLanguage }) {
 const ru = language === 'ru';
 const guide: { priority: Priority; text: string }[] = [
  { priority: 'high', text: ru ? 'Срочные или наиболее важные задачи. Выполните их в первую очередь.' : 'Urgent or worth a lot of points. Do these first.' },
  { priority: 'medium', text: ru ? 'Важные задачи, но время ещё есть.' : 'Important, but there is some time to spare.' },
  { priority: 'low', text: ru ? 'Могут подождать. Выполните, когда закончите остальные.' : 'Can wait. Handle when the rest is done.' },
 ];
 return <section className="card" aria-labelledby="priority-heading"><h2 id="priority-heading">{ru ? 'Уровни приоритета' : 'Priority guide'}</h2><ul className="guide">{guide.map((g) => <li key={g.priority}><PriorityBadge priority={g.priority} language={language} /><span>{g.text}</span></li>)}</ul></section>;
}
