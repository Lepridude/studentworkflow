export type Priority = 'low' | 'medium' | 'high';

/** Сохраняемый статус. «Overdue» не хранится, а вычисляется по дате. */
export type StoredStatus = 'todo' | 'in_progress' | 'done';
export type Status = StoredStatus | 'overdue';

export type Task = {
  id: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string; // YYYY-MM-DD
  priority: Priority;
  status: StoredStatus;
  createdAt: string; // ISO-дата
  calendarEventId?: string;
};

export type NewTaskInput = {
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
};
