import Icon from './Icon';
import { PriorityBadge, StatusBadge } from './Badges';
import type { Task } from '../types/task';
import { getStatus } from '../utils/tasks';
import { formatShortDate, relativeDue } from '../utils/dates';

type Props = {
  task: Task;
  now: Date;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function TaskItem({ task, now, onToggle, onDelete }: Props) {
  const status = getStatus(task, now);
  const done = task.status === 'done';

  return (
    <li className={`task${done ? ' is-done' : ''}${status === 'overdue' ? ' is-overdue' : ''}`}>
      <input
        type="checkbox"
        className="task-check"
        checked={done}
        onChange={() => onToggle(task.id)}
        aria-label={done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
      />
      <div className="task-body">
        <div className="task-title">{task.title}</div>
        <div className="task-meta">
          {task.subject && <span className="task-subject">{task.subject}</span>}
          <span className="task-due">
            {formatShortDate(task.dueDate)} · {relativeDue(task.dueDate, now)}
          </span>
        </div>
      </div>
      <div className="task-badges">
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={status} />
      </div>
      <button
        type="button"
        className="icon-btn"
        onClick={() => onDelete(task.id)}
        aria-label={`Delete "${task.title}"`}
      >
        <Icon name="trash" size={18} />
      </button>
    </li>
  );
}
