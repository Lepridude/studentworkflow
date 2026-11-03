import type { Task } from '../types/task';
import { offsetDate } from '../utils/dates';

/** Семь демо-задач. Сроки считаются от сегодняшнего дня. */
export function createDemoTasks(now: Date = new Date()): Task[] {
  const created = now.toISOString();
  return [
    {
      id: 'demo-1',
      title: 'Linear algebra problem set 5',
      description: 'Matrices, determinants and eigenvalues, exercises 1–12.',
      subject: 'Mathematics',
      dueDate: offsetDate(-2, now),
      priority: 'high',
      status: 'in_progress',
      createdAt: created,
    },
    {
      id: 'demo-2',
      title: 'Read chapters 7–8 of "Sapiens"',
      description: 'Take short notes for the seminar discussion.',
      subject: 'History',
      dueDate: offsetDate(-1, now),
      priority: 'medium',
      status: 'todo',
      createdAt: created,
    },
    {
      id: 'demo-3',
      title: 'Lab report: titration',
      description: 'Results table, graph and a short conclusion.',
      subject: 'Chemistry',
      dueDate: offsetDate(0, now),
      priority: 'high',
      status: 'in_progress',
      createdAt: created,
    },
    {
      id: 'demo-4',
      title: 'Essay outline: climate policy',
      description: 'Thesis, three arguments and a list of sources.',
      subject: 'Economics',
      dueDate: offsetDate(2, now),
      priority: 'medium',
      status: 'todo',
      createdAt: created,
    },
    {
      id: 'demo-5',
      title: 'Prepare presentation for CS project',
      description: '10 slides: problem, architecture, demo.',
      subject: 'Computer Science',
      dueDate: offsetDate(4, now),
      priority: 'high',
      status: 'todo',
      createdAt: created,
    },
    {
      id: 'demo-6',
      title: 'Vocabulary quiz: unit 6',
      description: 'Review 40 new words.',
      subject: 'English',
      dueDate: offsetDate(7, now),
      priority: 'low',
      status: 'todo',
      createdAt: created,
    },
    {
      id: 'demo-7',
      title: 'Submit scholarship application',
      description: 'Everything has been uploaded and confirmed.',
      subject: 'Administration',
      dueDate: offsetDate(-3, now),
      priority: 'medium',
      status: 'done',
      createdAt: created,
    },
  ];
}
