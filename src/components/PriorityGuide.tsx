import { PriorityBadge } from './Badges';
import type { Priority } from '../types/task';

const GUIDE: { priority: Priority; text: string }[] = [
  { priority: 'high', text: 'Urgent or worth a lot of points. Do these first.' },
  { priority: 'medium', text: 'Important, but there is some time to spare.' },
  { priority: 'low', text: 'Can wait. Handle when the rest is done.' },
];

export default function PriorityGuide() {
  return (
    <section className="card" aria-labelledby="priority-heading">
      <h2 id="priority-heading">Priority guide</h2>
      <ul className="guide">
        {GUIDE.map((g) => (
          <li key={g.priority}>
            <PriorityBadge priority={g.priority} />
            <span>{g.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
