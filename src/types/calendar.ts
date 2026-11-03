export type CalendarCategory = 'study' | 'deadline' | 'exam' | 'work' | 'personal' | 'other';
export type CalendarPriority = 'low' | 'medium' | 'high';
export type RepeatRule = 'none' | 'daily' | 'weekly' | 'monthly';
export type ReminderOption = 'none' | '15' | '60' | '1440' | '4320' | 'custom';

export type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  start: string; // Local datetime, YYYY-MM-DDTHH:mm
  end: string;
  category: CalendarCategory;
  priority: CalendarPriority;
  color: string;
  location: string;
  subject: string;
  reminder: ReminderOption;
  customReminderMinutes?: number;
  repeat: RepeatRule;
  repeatInterval?: number;
  repeatCount?: number;
  repeatUntil?: string;
  completed: boolean;
  createdAt: string;
  linkedTaskId?: string;
  source?: 'external';
  externalUid?: string;
};

export type CalendarEventInput = Omit<CalendarEvent, 'id' | 'createdAt'>;
