import type { Task } from './types/task';
import type { CalendarEvent, CalendarCategory } from './types/calendar';
import { loadTasks, saveTasks } from './storage';
import { loadCalendarEvents, saveCalendarEvents } from './calendarStorage';

const colors: Record<CalendarCategory, string> = {
  study: '#4f46e5',
  deadline: '#dc2626',
  exam: '#d97706',
  work: '#0891b2',
  personal: '#16a34a',
  other: '#64748b',
};

const taskDateTime = (date: string, hour: number) =>
  `${date}T${String(hour).padStart(2, '0')}:00`;

function findEventForTask(events: CalendarEvent[], task: Task): CalendarEvent | undefined {
  return events.find(event =>
    event.linkedTaskId === task.id
    || (task.calendarEventId !== undefined && event.id === task.calendarEventId)
    || event.id === `task-${task.id}`
  );
}

function toCalendarEvent(task: Task, existing?: CalendarEvent): CalendarEvent {
  return {
    id: existing?.id || task.calendarEventId || `task-${task.id}`,
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
    repeat: task.repeat || 'none',
    repeatInterval: task.repeatInterval,
    repeatUntil: task.repeatUntil ? task.repeatUntil + 'T23:59' : undefined,
    completed: task.status === 'done',
    createdAt: existing?.createdAt || task.createdAt,
  };
}

/** Синхронизирует задачи пакетно, сохраняя пользовательские настройки событий. */
export function syncTasksToCalendar(tasks: Task[]): void {
  const events = loadCalendarEvents();
  const taskIds = new Set(tasks.map(task => task.id));
  const taskEvents = new Map<string, CalendarEvent>();

  for (const task of tasks) {
    const existing = findEventForTask(events, task);
    if (existing) taskEvents.set(task.id, toCalendarEvent(task, existing));
    else taskEvents.set(task.id, toCalendarEvent(task));
  }

  const nextEvents = events.filter(event => {
    const linkedTaskId = event.linkedTaskId
      || tasks.find(task => task.calendarEventId === event.id || event.id === `task-${task.id}`)?.id;
    return !linkedTaskId || !taskIds.has(linkedTaskId);
  });

  nextEvents.push(...taskEvents.values());
  saveCalendarEvents(nextEvents);
}

export function syncTaskToCalendar(task: Task): void {
  syncTasksToCalendar([task]);
}

export function removeCalendarEventForTask(taskId: string): void {
  const tasks = loadTasks();
  const task = tasks.find(item => item.id === taskId);
  const events = loadCalendarEvents();
  saveCalendarEvents(events.filter(event =>
    event.linkedTaskId !== taskId
    && (!task || event.id !== task.calendarEventId)
    && event.id !== `task-${taskId}`
  ));
}

function toTask(event: CalendarEvent, linked?: Task): Task {
  const id = linked?.id || event.linkedTaskId || `calendar-${event.id}`;
  return {
    id,
    calendarEventId: event.id,
    title: event.title,
    description: event.description,
    subject: event.subject,
    repeat: event.repeat,
    repeatInterval: event.repeatInterval || 1,
    repeatUntil: event.repeatUntil?.slice(0, 10),
    dueDate: event.start.slice(0, 10),
    priority: event.priority,
    status: event.completed ? 'done' : 'todo',
    createdAt: linked?.createdAt || event.createdAt || new Date().toISOString(),
  };
}

export function syncCalendarEventToTask(event: CalendarEvent): CalendarEvent {
  if (event.source === 'external') return event;
  const tasks = loadTasks();
  if (event.category !== 'deadline') {
    const linked = tasks.find(task => task.id === event.linkedTaskId || task.calendarEventId === event.id);
    if (linked) saveTasks(tasks.filter(task => task.id !== linked.id));
    const { linkedTaskId: _linkedTaskId, ...unlinkedEvent } = event;
    return unlinkedEvent;
  }
  const linked = tasks.find(task =>
    task.id === event.linkedTaskId
    || task.calendarEventId === event.id
    || event.id === `task-${task.id}`
  );
  const task = toTask(event, linked);
  saveTasks(linked ? tasks.map(item => item.id === linked.id ? task : item) : [...tasks, task]);
  return { ...event, linkedTaskId: task.id };
}

/** Обновляет задачи одной записью, а не отдельной записью на каждое событие. */
export function syncCalendarEventsToTasks(events: CalendarEvent[]): CalendarEvent[] {
  const tasks = loadTasks();
  const nextTasks = [...tasks];

  const linkedEvents = events.map(event => {
    if (event.source === 'external') return event;
    if (event.category !== 'deadline') {
      const linked = nextTasks.find(task => task.id === event.linkedTaskId || task.calendarEventId === event.id);
      if (linked) nextTasks.splice(nextTasks.findIndex(task => task.id === linked.id), 1);
      const { linkedTaskId: _linkedTaskId, ...unlinkedEvent } = event;
      return unlinkedEvent;
    }

    const linked = nextTasks.find(task =>
      task.id === event.linkedTaskId
      || task.calendarEventId === event.id
      || event.id === `task-${task.id}`
    );
    const task = toTask(event, linked);

    if (linked) {
      const index = nextTasks.findIndex(item => item.id === linked.id);
      nextTasks[index] = task;
    } else {
      nextTasks.push(task);
    }

    return { ...event, linkedTaskId: task.id };
  });

  saveTasks(nextTasks);
  return linkedEvents;
}

export function removeTaskForCalendarEvent(event: CalendarEvent): void {
  const tasks = loadTasks();
  const linked = tasks.find(task =>
    task.id === event.linkedTaskId
    || task.calendarEventId === event.id
    || event.id === `task-${task.id}`
  );
  if (!linked) return;
  saveTasks(tasks.filter(task => task.id !== linked.id));
}
