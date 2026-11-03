# studentworkflow

Планировщик студента: Vite + React + TypeScript, без бэкенда. Задачи хранятся в localStorage.

## Запуск

Нужны Node.js 20+ и npm.

```bash
npm install
npm run dev
```

Откройте адрес, который покажет Vite (обычно http://localhost:5173).

Проверка типов и сборка: `npm run build`.

## Структура

```
src/
  main.tsx          точка входа
  App.tsx           каркас: Sidebar + Topbar + страница
  index.css         все стили
  storage.ts        чтение/запись задач в localStorage
  types/task.ts     типы Task, Priority, Status
  data/tasks.ts     семь демо-задач (сроки считаются от сегодняшнего дня)
  utils/            даты и расчёты по задачам (без React)
  components/       Sidebar, Topbar, StatsGrid, TaskList, TaskItem,
                    UpcomingDeadlines, PriorityGuide, Badges, AddTaskModal, Icon
  pages/Dashboard.tsx   хранит список задач и связывает блоки
```

Состояние лежит в одном месте, в `Dashboard`. Остальные компоненты только показывают данные
и сообщают о событиях. Статус «Overdue» не хранится, а вычисляется по дате.

## Сброс демо-данных

В консоли браузера: `localStorage.removeItem('studentworkflow.tasks.v1')` и перезагрузка страницы.
