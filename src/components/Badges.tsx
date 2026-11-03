import type { Priority, Status } from '../types/task';

const STATUS_LABEL: Record<Status, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
  overdue: 'Overdue',
};

const PRIORITY_LABEL: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`badge status-${status}`}>{STATUS_LABEL[status]}</span>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`badge priority-${priority}`}>
      <span className="dot" aria-hidden="true" />
      {PRIORITY_LABEL[priority]}
    </span>
  );
}
