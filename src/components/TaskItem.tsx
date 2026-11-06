import Icon from './Icon';
import { PriorityBadge, StatusBadge } from './Badges';
import type { Task } from '../types/task';
import { effectiveDueDate, getStatus } from '../utils/tasks';
import { formatShortDate, relativeDue } from '../utils/dates';
import type { AppLanguage } from '../settings';
type Props = { task: Task; now: Date; onToggle: (id: string) => void; onDelete: (id: string) => void; language: AppLanguage };
export default function TaskItem({ task, now, onToggle, onDelete, language }: Props) {
 const status = getStatus(task, now); const done = task.status === 'done'; const ru = language === 'ru'; const dueDate = effectiveDueDate(task, now);
 return <li id={'task-' + task.id} className={'task' + (done ? ' is-done' : '') + (status === 'overdue' ? ' is-overdue' : '')}>
  <input type="checkbox" className="task-check" checked={done} onChange={() => onToggle(task.id)} aria-label={ru ? (done ? 'Вернуть задачу в работу: ' + task.title : 'Отметить выполненной: ' + task.title) : (done ? 'Mark as not done: ' + task.title : 'Mark as done: ' + task.title)} />
  <div className="task-body"><div className="task-title">{task.title}</div><div className="task-meta">{task.subject && <span className="task-subject">{task.subject}</span>}{task.repeat && task.repeat !== 'none' && <span>{ru ? 'Повторяется' : 'Repeats'}: {task.repeat === 'daily' ? (ru ? 'ежедневно' : 'daily') : task.repeat === 'weekly' ? (ru ? 'еженедельно' : 'weekly') : (ru ? 'ежемесячно' : 'monthly')}</span>}<span className="task-due">{formatShortDate(dueDate, language)} · {relativeDue(dueDate, now, language)}</span></div></div>
  <div className="task-badges"><PriorityBadge priority={task.priority} language={language} /><StatusBadge status={status} language={language} /></div>
  <button type="button" className="icon-btn" onClick={() => onDelete(task.id)} aria-label={ru ? 'Удалить задачу: ' + task.title : 'Delete: ' + task.title}><Icon name="trash" size={18} /></button>
 </li>;
}
