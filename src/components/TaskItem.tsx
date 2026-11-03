import Icon from './Icon';
import { PriorityBadge, StatusBadge } from './Badges';
import type { Task } from '../types/task';
import { getStatus } from '../utils/tasks';
import { formatShortDate, relativeDue } from '../utils/dates';
import type { AppLanguage } from '../settings';
type Props = { task: Task; now: Date; onToggle: (id: string) => void; onDelete: (id: string) => void; language: AppLanguage };
export default function TaskItem({ task, now, onToggle, onDelete, language }: Props) {
 const status = getStatus(task, now); const done = task.status === 'done'; const ru = language === 'ru';
 return <li id={'task-' + task.id} className={'task' + (done ? ' is-done' : '') + (status === 'overdue' ? ' is-overdue' : '')}>
  <input type="checkbox" className="task-check" checked={done} onChange={() => onToggle(task.id)} aria-label={ru ? (done ? 'Вернуть задачу в работу: ' + task.title : 'Отметить выполненной: ' + task.title) : (done ? 'Mark as not done: ' + task.title : 'Mark as done: ' + task.title)} />
  <div className="task-body"><div className="task-title">{task.title}</div><div className="task-meta">{task.subject && <span className="task-subject">{task.subject}</span>}<span className="task-due">{formatShortDate(task.dueDate, language)} · {relativeDue(task.dueDate, now, language)}</span></div></div>
  <div className="task-badges"><PriorityBadge priority={task.priority} language={language} /><StatusBadge status={status} language={language} /></div>
  <button type="button" className="icon-btn" onClick={() => onDelete(task.id)} aria-label={ru ? 'Удалить задачу: ' + task.title : 'Delete: ' + task.title}><Icon name="trash" size={18} /></button>
 </li>;
}
