import type { Task } from './types/task';
import type { CalendarEvent, CalendarCategory } from './types/calendar';
import { loadTasks, saveTasks } from './storage';
import { loadCalendarEvents, saveCalendarEvents } from './calendarStorage';

const colors: Record<CalendarCategory, string> = {
  study: '#4f46e5', deadline: '#dc2626', exam: '#d97706',
  work: '#0891b2', personal: '#16a34a', other: '#64748b',
};

const taskDateTime = (date: string, hour: number) => date + 'T' + String(hour).padStart(2, '0') + ':00';

/** One task has exactly one linked calendar deadline. */
export function syncTaskToCalendar(task: Task): void {
  const events = loadCalendarEvents();
  const existing = events.find(event => event.linkedTaskId === task.id);
  const event: CalendarEvent = {
    id: existing?.id || task.calendarEventId || 'task-' + task.id,
    linkedTaskId: task.id,
    title: task.title,
    description: task.description,
    start: taskDateTime(task.dueDate, existing ? new Date(existing.start).getHours() : 9),
    end: taskDateTime(task.dueDate, existing ? new Date(existing.end).getHours() : 10),
    category: 'deadline',
    priority: task.priority,
    color: existing?.color || colors.deadline,
    location: existing?.location || '',
    subject: task.subject,
    reminder: existing?.reminder || 'none',
    customReminderMinutes: existing?.customReminderMinutes,
    repeat: 'none',
    completed: task.status === 'done',
    createdAt: existing?.createdAt || task.createdAt,
  };
  const next = existing ? events.map(item => item.id === existing.id ? event : item) : [...events, event];
  saveCalendarEvents(next);
}

export function syncTasksToCalendar(tasks: Task[]): void {
  for (const task of tasks) syncTaskToCalendar(task);
}

export function removeCalendarEventForTask(taskId: string): void {
  saveCalendarEvents(loadCalendarEvents().filter(event => event.linkedTaskId !== taskId));
}

export function syncCalendarEventToTask(event: CalendarEvent): CalendarEvent {
  const tasks = loadTasks();
  const linked = tasks.find(task => task.id === event.linkedTaskId)
    || tasks.find(task => task.calendarEventId === event.id);
  const id = linked?.id || event.linkedTaskId || 'calendar-' + event.id;
  const task: Task = {
    id,
    calendarEventId: event.id,
    title: event.title,
    description: event.description,
    subject: event.subject,
    dueDate: event.start.slice(0, 10),
    priority: event.priority,
    status: event.completed ? 'done' : 'todo',
    createdAt: linked?.createdAt || event.createdAt || new Date().toISOString(),
  };
  saveTasks(linked ? tasks.map(item => item.id === linked.id ? task : item) : [...tasks, task]);
  return { ...event, linkedTaskId: id };
}

export function syncCalendarEventsToTasks(events: CalendarEvent[]): CalendarEvent[] {
  return events.map(syncCalendarEventToTask);
}

export function removeTaskForCalendarEvent(event: CalendarEvent): void {
  if (!event.linkedTaskId) return;
  saveTasks(loadTasks().filter(task => task.id !== event.linkedTaskId));
}

export function syncTaskCompletionToCalendar(taskId: string, completed: boolean): void {
  saveCalendarEvents(loadCalendarEvents().map(event =>
    event.linkedTaskId === taskId ? { ...event, completed } : event
  ));
}
