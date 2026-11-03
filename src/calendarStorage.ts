import type { CalendarEvent } from './types/calendar';

const EVENTS_KEY = 'studentworkflow.calendar.events.v1';

function isValidEvent(value: unknown): value is CalendarEvent {
  if (!value || typeof value !== 'object') return false;
  const event = value as Partial<CalendarEvent>;
  return typeof event.id === 'string'
    && typeof event.title === 'string'
    && typeof event.start === 'string'
    && !Number.isNaN(new Date(event.start).getTime())
    && typeof event.end === 'string'
    && !Number.isNaN(new Date(event.end).getTime())
    && new Date(event.end).getTime() > new Date(event.start).getTime()
    && typeof event.category === 'string'
    && typeof event.completed === 'boolean';
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
