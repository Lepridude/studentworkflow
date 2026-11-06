import { useCallback, useEffect, useState } from 'react';
import TaskList from '../components/TaskList';
import AddTaskModal from '../components/AddTaskModal';
import type { NewTaskInput, Task } from '../types/task';
import { loadTasks, saveTasks } from '../storage';
import { getStatus, newId } from '../utils/tasks';
import { removeCalendarEventForTask, syncTasksToCalendar } from '../taskCalendarSync';
import type { AppLanguage } from '../settings';
import { loadSubjects } from '../subjects';

type Props = { now: Date; language: AppLanguage };
export default function TasksPage({ now, language }: Props) {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'done' | 'overdue'>('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const ru = language === 'ru';
  useEffect(() => { saveTasks(tasks); syncTasksToCalendar(tasks); }, [tasks]);
  const addTask = useCallback((input: NewTaskInput) => {
    const task: Task = { id: newId(), title: input.title, description: input.description, subject: input.subject, dueDate: input.dueDate, priority: input.priority, status: 'todo', createdAt: new Date().toISOString() };
    setTasks(prev => [task, ...prev]);
    setModalOpen(false);
  }, []);
  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task => task.id === id ? { ...task, status: task.status === 'done' ? 'todo' : 'done' } : task));
  }, []);
  const deleteTask = useCallback((id: string) => {
    removeCalendarEventForTask(id);
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);
  const subjects = Array.from(new Set([...tasks.map(task => task.subject.trim()), ...loadSubjects().map(subject => subject.name)].filter(Boolean))).sort((a, b) => a.localeCompare(b, language === 'ru' ? 'ru' : 'en'));
  const normalizedQuery = query.trim().toLocaleLowerCase(language === 'ru' ? 'ru' : 'en');
  const filteredTasks = tasks.filter(task => {
    const matchesQuery = !normalizedQuery || [task.title, task.description, task.subject].some(value => value.toLocaleLowerCase(language === 'ru' ? 'ru' : 'en').includes(normalizedQuery));
    const status = getStatus(task, now);
    const matchesStatus = statusFilter === 'all'
      || (statusFilter === 'active' && status !== 'done')
      || (statusFilter === 'done' && status === 'done')
      || (statusFilter === 'overdue' && status === 'overdue');
    const matchesSubject = subjectFilter === 'all' || task.subject === subjectFilter;
    return matchesQuery && matchesStatus && matchesSubject;
  });
  return <div className="page">
    <div className="page-head"><h1>{ru ? 'Мои задачи' : 'My Tasks'}</h1><p className="muted">{ru ? 'Задачи с дедлайнами автоматически появляются в календаре.' : 'Tasks with due dates appear in the calendar automatically.'}</p></div>
    <div className="task-filters">
      <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={ru ? 'Поиск по задачам и предметам…' : 'Search tasks and subjects…'} aria-label={ru ? 'Поиск задач' : 'Search tasks'} />
      <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)} aria-label={ru ? 'Фильтр по статусу' : 'Filter by status'}>
        <option value="all">{ru ? 'Все задачи' : 'All tasks'}</option>
        <option value="active">{ru ? 'Активные' : 'Active'}</option>
        <option value="done">{ru ? 'Выполненные' : 'Completed'}</option>
        <option value="overdue">{ru ? 'Просроченные' : 'Overdue'}</option>
      </select>
      <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} aria-label={ru ? 'Фильтр по предмету' : 'Filter by subject'}>
        <option value="all">{ru ? 'Все предметы' : 'All subjects'}</option>
        {subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}
      </select>
      {(query || statusFilter !== 'all' || subjectFilter !== 'all') && <button type="button" className="btn" onClick={() => { setQuery(''); setStatusFilter('all'); setSubjectFilter('all'); }}>{ru ? 'Сбросить' : 'Reset'}</button>}
      <span className="task-filter-count">{ru ? 'Показано' : 'Showing'}: {filteredTasks.length} / {tasks.length}</span>
    </div>
    <TaskList tasks={filteredTasks} now={now} onToggle={toggleTask} onDelete={deleteTask} onAddClick={() => setModalOpen(true)} language={language} />
    {modalOpen && <AddTaskModal onClose={() => setModalOpen(false)} onSubmit={addTask} language={language} />}
  </div>;
}
