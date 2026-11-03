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

type Props = {
  now: Date;
  userName: string;
};

/** Единственное место, где живёт список задач. */
export default function Dashboard({ now, userName }: Props) {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const stats = useMemo(() => computeStats(tasks, now), [tasks, now]);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t,
      ),
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addTask = useCallback((input: NewTaskInput) => {
    const task: Task = {
      id: newId(),
      title: input.title,
      description: input.description,
      subject: '',
      dueDate: input.dueDate,
      priority: input.priority,
      status: 'todo',
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [task, ...prev]);
    setModalOpen(false);
  }, []);

  const closeModal = useCallback(() => setModalOpen(false), []);

  const openCount = stats.total - stats.done;

  return (
    <div className="page">
      <div className="page-head">
        <h1>
          {greetingFor(now)}, {userName}
        </h1>
        <p className="muted">
          {openCount === 0
            ? 'Everything is done. Nice work!'
            : `You have ${openCount} open ${openCount === 1 ? 'task' : 'tasks'}` +
              (stats.overdue > 0 ? `, ${stats.overdue} overdue.` : '. Keep it up.')}
        </p>
      </div>

      <StatsGrid stats={stats} />

      <div className="columns">
        <TaskList
          tasks={tasks}
          now={now}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onAddClick={() => setModalOpen(true)}
        />
        <div className="side-column">
          <UpcomingDeadlines tasks={tasks} now={now} />
          <PriorityGuide />
        </div>
      </div>

      {modalOpen && <AddTaskModal onClose={closeModal} onSubmit={addTask} />}
    </div>
  );
}
