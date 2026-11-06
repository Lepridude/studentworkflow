import type { Task } from './types/task';
import type { CalendarEvent } from './types/calendar';
import { loadTasks, saveTasks } from './storage';
import { loadCalendarEvents, saveCalendarEvents } from './calendarStorage';

export type Subject = { id: string; name: string; color: string };
const KEY = 'studentworkflow.subjects.v1';
const PALETTE = ['#4f46e5', '#0891b2', '#16a34a', '#d97706', '#db2777', '#7c3aed', '#64748b'];

function validSubject(value: unknown): value is Subject {
  if (!value || typeof value !== 'object') return false;
  const subject = value as Partial<Subject>;
  return typeof subject.id === 'string' && typeof subject.name === 'string'
    && subject.name.trim().length > 0 && typeof subject.color === 'string';
}

export function loadSubjects(): Subject[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw !== null) {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(validSubject) : [];
    }
    const names = new Set([
      ...loadTasks().map(task => task.subject),
      ...loadCalendarEvents().map(event => event.subject),
    ].map(name => name.trim()).filter(Boolean));
    const initial = [...names].sort((a, b) => a.localeCompare(b)).map((name, index) => ({
      id: `subject-${index + 1}`, name, color: PALETTE[index % PALETTE.length],
    }));
    saveSubjects(initial);
    return initial;
  } catch {
    return [];
  }
}

export function saveSubjects(subjects: Subject[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(subjects));
    window.dispatchEvent(new Event('studentflow:data-changed'));
    return true;
  } catch {
    return false;
  }
}

export function createSubject(name: string, color: string): Subject | null {
  const normalized = name.trim();
  if (!normalized || loadSubjects().some(item => item.name.toLocaleLowerCase() === normalized.toLocaleLowerCase())) return null;
  const subject = { id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `subject-${Date.now()}`, name: normalized, color };
  const subjects = loadSubjects();
  return saveSubjects([...subjects, subject]) ? subject : null;
}

export function updateSubject(id: string, name: string, color: string): boolean {
  const normalized = name.trim();
  const subjects = loadSubjects();
  const current = subjects.find(item => item.id === id);
  if (!current || !normalized || subjects.some(item => item.id !== id && item.name.toLocaleLowerCase() === normalized.toLocaleLowerCase())) return false;
  const updated = subjects.map(item => item.id === id ? { ...item, name: normalized, color } : item);
  if (!saveSubjects(updated)) return false;
  if (current.name !== normalized) {
    const tasks: Task[] = loadTasks();
    saveTasks(tasks.map(task => task.subject === current.name ? { ...task, subject: normalized } : task));
    const events: CalendarEvent[] = loadCalendarEvents();
    saveCalendarEvents(events.map(event => event.subject === current.name ? { ...event, subject: normalized } : event));
  }
  return true;
}

export function deleteSubject(id: string): boolean {
  const subjects = loadSubjects();
  const subject = subjects.find(item => item.id === id);
  if (!subject || !saveSubjects(subjects.filter(item => item.id !== id))) return false;
  const tasks = loadTasks();
  saveTasks(tasks.map(task => task.subject === subject.name ? { ...task, subject: '' } : task));
  const events = loadCalendarEvents();
  saveCalendarEvents(events.map(event => event.subject === subject.name ? { ...event, subject: '' } : event));
  return true;
}
