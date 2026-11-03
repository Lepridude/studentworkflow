import type { Task } from './types/task';
import { createDemoTasks } from './data/tasks';

const KEY = 'studentworkflow.tasks.v1';

/**
 * Весь доступ к данным идёт через этот модуль: позже его можно заменить
 * на запросы к API, не трогая интерфейс.
 * Если в браузере ничего не сохранено, возвращаются демо-задачи.
 */
export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Task[];
    }
  } catch {
    // повреждённые данные или недоступный localStorage — начинаем с демо
  }
  return createDemoTasks();
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(tasks));
  } catch {
    // переполнение или приватный режим — молча пропускаем
  }
}
