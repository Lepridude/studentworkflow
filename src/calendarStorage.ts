import type { CalendarEvent, CalendarCategory, CalendarPriority, ReminderOption, RepeatRule } from './types/calendar';

const EVENTS_KEY = 'studentworkflow.calendar.events.v1';

const CATEGORIES: readonly CalendarCategory[] = ['study', 'deadline', 'exam', 'work', 'personal', 'other'];
const PRIORITIES: readonly CalendarPriority[] = ['low', 'medium', 'high'];
const REMINDERS: readonly ReminderOption[] = ['none', '15', '60', '1440', '4320', 'custom'];
const REPEATS: readonly RepeatRule[] = ['none', 'daily', 'weekly', 'monthly'];

function isValidEvent(value: unknown): value is CalendarEvent {
  if (!value || typeof value !== 'object') return false;

  const event = value as Partial<CalendarEvent>;
  const start = typeof event.start === 'string' ? new Date(event.start).getTime() : NaN;
  const end = typeof event.end === 'string' ? new Date(event.end).getTime() : NaN;

  return typeof event.id === 'string'
    && event.id.length > 0
    && typeof event.title === 'string'
    && typeof event.description === 'string'
    && Number.isFinite(start)
    && Number.isFinite(end)
    && end > start
    && CATEGORIES.includes(event.category as CalendarCategory)
    && PRIORITIES.includes(event.priority as CalendarPriority)
    && typeof event.color === 'string'
    && typeof event.location === 'string'
    && typeof event.subject === 'string'
    && REMINDERS.includes(event.reminder as ReminderOption)
    && (event.customReminderMinutes === undefined
      || (Number.isInteger(event.customReminderMinutes) && event.customReminderMinutes > 0))
    && REPEATS.includes(event.repeat as RepeatRule)
    && (event.repeatInterval === undefined || (Number.isInteger(event.repeatInterval) && event.repeatInterval >= 1))
    && (event.repeatCount === undefined || (Number.isInteger(event.repeatCount) && event.repeatCount >= 1))
    && (event.repeatUntil === undefined || (typeof event.repeatUntil === 'string' && Number.isFinite(new Date(event.repeatUntil).getTime())))
    && typeof event.completed === 'boolean'
    && typeof event.createdAt === 'string'
    && (event.linkedTaskId === undefined || typeof event.linkedTaskId === 'string')
    && (event.source === undefined || event.source === 'external')
    && (event.externalUid === undefined || typeof event.externalUid === 'string');
}

export function loadCalendarEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidEvent) : [];
  } catch {
    return [];
  }
}

export function saveCalendarEvents(events: CalendarEvent[]): boolean {
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    return true;
  } catch {
    return false;
  }
}
