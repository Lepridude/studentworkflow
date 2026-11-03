import { useCallback, useEffect, useMemo, useState } from 'react';
import StatsGrid from '../components/StatsGrid';
import TaskList from '../components/TaskList';
import UpcomingDeadlines from '../components/UpcomingDeadlines';
import PriorityGuide from '../components/PriorityGuide';
import AddTaskModal from '../components/AddTaskModal';
import type { NewTaskInput, Task } from '../types/task';
import { loadTasks, saveTasks } from '../storage';
import { computeStats, newId } from '../utils/tasks';
import { greetingFor } from '../utils/dates';
import type { AppLanguage } from '../settings';

type Props = { now: Date; userName: string; language: AppLanguage };
export default function Dashboard({ now, userName, language }: Props) {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => { saveTasks(tasks); }, [tasks]);
  const stats = useMemo(() => computeStats(tasks, now), [tasks, now]);
  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((task) => task.id === id ? { ...task, status: task.status === 'done' ? 'todo' : 'done' } : task));
  }, []);
  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);
  const addTask = useCallback((input: NewTaskInput) => {
    const task: Task = {
      id: newId(), title: input.title, description: input.description, subject: '',
      dueDate: input.dueDate, priority: input.priority, status: 'todo', createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [task, ...prev]);
    setModalOpen(false);
  }, []);
  const openCount = stats.total - stats.done;
  const ru = language === 'ru';
  const greeting = ru
    ? (now.getHours() >= 5 && now.getHours() < 12 ? 'Доброе утро'
      : now.getHours() >= 12 && now.getHours() < 18 ? 'Добрый день'
      : now.getHours() >= 18 && now.getHours() < 23 ? 'Добрый вечер' : 'Доброй ночи')
    : greetingFor(now);
  return <div className="page">
    <div className="page-head">
      <h1>{greeting}, {userName}</h1>
      <p className="muted">{openCount === 0
        ? (ru ? 'Все задачи выполнены.' : 'Everything is done. Nice work!')
        : ru
          ? `У вас ${openCount} активных задач${stats.overdue > 0 ? `, просрочено: ${stats.overdue}.` : '.'}`
          : `You have ${openCount} open ${openCount === 1 ? 'task' : 'tasks'}${stats.overdue > 0 ? `, ${stats.overdue} overdue.` : '. Keep it up.'}`}</p>
    </div>
    <StatsGrid stats={stats} />
    <div className="columns">
      <TaskList tasks={tasks} now={now} onToggle={toggleTask} onDelete={deleteTask} onAddClick={() => setModalOpen(true)} />
      <div className="side-column"><UpcomingDeadlines tasks={tasks} now={now} /><PriorityGuide /></div>
    </div>
    {modalOpen && <AddTaskModal onClose={() => setModalOpen(false)} onSubmit={addTask} />}
  </div>;
}
