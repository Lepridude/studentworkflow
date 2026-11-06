import type { Priority, Status, Task } from '../types/task';
import { daysUntil } from './dates';

/** Возвращает ближайшую дату повторяющейся задачи, не сдвигая исходную дату в хранилище. */
export function effectiveDueDate(task: Task, now: Date = new Date()): string {
  if (!task.repeat || task.repeat === 'none') return task.dueDate;
  const [year, month, day] = task.dueDate.split('-').map(Number);
  let date = new Date(year, month - 1, day);
  const interval = Math.max(1, task.repeatInterval || 1);
  const limit = task.repeatUntil ? new Date(task.repeatUntil + 'T23:59:59') : null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let guard = 0;
  while (date < today && guard++ < 10000) {
    if (task.repeat === 'daily') date.setDate(date.getDate() + interval);
    else if (task.repeat === 'weekly') date.setDate(date.getDate() + 7 * interval);
    else {
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + interval, 1);
      const lastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
      date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), Math.min(day, lastDay));
    }
  }
  if (limit && date > limit) return task.dueDate;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Итоговый статус учитывает ближайшее вхождение повторяющейся задачи. */
export function getStatus(task: Task, now: Date = new Date()): Status {
  if (task.status === 'done') return 'done';
  if (daysUntil(effectiveDueDate(task, now), now) < 0) return 'overdue';
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
        effectiveDueDate(a).localeCompare(effectiveDueDate(b)) ||
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
