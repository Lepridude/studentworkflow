import Icon from './Icon';
import TaskItem from './TaskItem';
import type { Task } from '../types/task';
import { sortForList } from '../utils/tasks';
import type { AppLanguage } from '../settings';
type Props = { tasks: Task[]; now: Date; onToggle: (id: string) => void; onDelete: (id: string) => void; onAddClick: () => void; language: AppLanguage };
export default function TaskList({ tasks, now, onToggle, onDelete, onAddClick, language }: Props) {
  const sorted = sortForList(tasks); const ru = language === 'ru';
  return <section className="card task-list-card" aria-labelledby="tasks-heading"><div className="card-head"><h2 id="tasks-heading">{ru ? 'Ваши задачи' : 'Your tasks'}</h2><button type="button" className="btn btn-primary" onClick={onAddClick}><Icon name="plus" size={18} />{ru ? 'Добавить задачу' : 'Add Task'}</button></div>
    {sorted.length === 0 ? <p className="empty">{ru ? 'Задач пока нет. Добавьте первую!' : 'No tasks yet. Add your first one!'}</p> : <ul className="task-list">{sorted.map((t) => <TaskItem key={t.id} task={t} now={now} onToggle={onToggle} onDelete={onDelete} language={language} />)}</ul>}
  </section>;
}
