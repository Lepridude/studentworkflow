import { useCallback, useEffect, useState } from 'react';
import TaskList from '../components/TaskList';
import AddTaskModal from '../components/AddTaskModal';
import type { NewTaskInput, Task } from '../types/task';
import { loadTasks, saveTasks } from '../storage';
import { newId } from '../utils/tasks';
import { removeCalendarEventForTask, syncTasksToCalendar } from '../taskCalendarSync';
import type { AppLanguage } from '../settings';

type Props = { now: Date; language: AppLanguage };
export default function TasksPage({ now, language }: Props) {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [modalOpen, setModalOpen] = useState(false);
  const ru = language === 'ru';
  useEffect(() => { saveTasks(tasks); syncTasksToCalendar(tasks); }, [tasks]);
  const addTask = useCallback((input: NewTaskInput) => {
    const task: Task = { id: newId(), title: input.title, description: input.description, subject: '', dueDate: input.dueDate, priority: input.priority, status: 'todo', createdAt: new Date().toISOString() };
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
  return <div className="page">
    <div className="page-head"><h1>{ru ? 'Мои задачи' : 'My Tasks'}</h1><p className="muted">{ru ? 'Все задачи автоматически отображаются в календаре по сроку выполнения.' : 'Every task is automatically shown in the calendar on its due date.'}</p></div>
    <TaskList tasks={tasks} now={now} onToggle={toggleTask} onDelete={deleteTask} onAddClick={() => setModalOpen(true)} language={language} />
    {modalOpen && <AddTaskModal onClose={() => setModalOpen(false)} onSubmit={addTask} language={language} />}
  </div>;
}
