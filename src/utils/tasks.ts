import type { Priority, Status, Task } from '../types/task';
import { daysUntil } from './dates';

/** Итоговый статус: незавершённая задача с прошедшим сроком — overdue. */
export function getStatus(task: Task, now: Date = new Date()): Status {
  if (task.status === 'done') return 'done';
  if (daysUntil(task.dueDate, now) < 0) return 'overdue';
  return task.status;
}

export type Stats = {
  total: number;
  done: number;
  inProgress: number;
  overdue: number;
};

export function computeStats(tasks: Task[], now: Date = new Date()): Stats {
  const stats: Stats = { total: tasks.length, done: 0, inProgress: 0, overdue: 0 };
  for (const t of tasks) {
    const s = getStatus(t, now);
    if (s === 'done') stats.done += 1;
    else if (s === 'in_progress') stats.inProgress += 1;
    else if (s === 'overdue') stats.overdue += 1;
  }
  return stats;
}

const PRIORITY_WEIGHT: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

/** Ближайшие дедлайны: незавершённые задачи, от самых срочных. */
export function upcomingDeadlines(tasks: Task[], limit = 4): Task[] {
  return tasks
    .filter((t) => t.status !== 'done')
    .sort(
      (a, b) =>
        a.dueDate.localeCompare(b.dueDate) ||
        PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority],
    )
    .slice(0, limit);
}

/** Список для основной области: активные сверху, выполненные внизу. */
export function sortForList(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const doneDiff = Number(a.status === 'done') - Number(b.status === 'done');
    if (doneDiff !== 0) return doneDiff;
    return a.dueDate.localeCompare(b.dueDate);
  });
}

export function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
