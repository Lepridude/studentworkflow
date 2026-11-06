import type { Task, Priority, StoredStatus, TaskRepeatRule } from './types/task';

const KEY = 'studentworkflow.tasks.v1';

const PRIORITIES: readonly Priority[] = ['low', 'medium', 'high'];
const STATUSES: readonly StoredStatus[] = ['todo', 'in_progress', 'done'];
const REPEATS: readonly TaskRepeatRule[] = ['none', 'daily', 'weekly', 'monthly'];

function isValidTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false;

  const task = value as Partial<Task>;
  return typeof task.id === 'string'
    && task.id.length > 0
    && typeof task.title === 'string'
    && typeof task.description === 'string'
    && (task.subject === undefined || typeof task.subject === 'string')
    && typeof task.dueDate === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(task.dueDate)
    && !Number.isNaN(new Date(`${task.dueDate}T00:00:00`).getTime())
    && PRIORITIES.includes(task.priority as Priority)
    && STATUSES.includes(task.status as StoredStatus)
    && typeof task.createdAt === 'string'
    && !Number.isNaN(Date.parse(task.createdAt))
    && (task.calendarEventId === undefined || typeof task.calendarEventId === 'string')
    && (task.repeat === undefined || REPEATS.includes(task.repeat as TaskRepeatRule))
    && (task.repeatInterval === undefined || (Number.isInteger(task.repeatInterval) && task.repeatInterval >= 1))
    && (task.repeatUntil === undefined || (typeof task.repeatUntil === 'string' && /^\\d{4}-\\d{2}-\\d{2}$/.test(task.repeatUntil)));
}

/** Reads persisted tasks and uses demo data only on a genuinely fresh install. */
export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return [];

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(isValidTask).filter(task => !/^demo-[1-7]$/.test(task.id)).map(task => ({ ...task, subject: task.subject || '' }))
      : [];
  } catch {
    return [];
  }
}

/** Returns false when the browser cannot persist the current task list. */
export function saveTasks(tasks: Task[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
}
