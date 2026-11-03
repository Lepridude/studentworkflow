import type { Priority, Status } from '../types/task';
import type { AppLanguage } from '../settings';
const STATUS_LABEL: Record<Status, Record<AppLanguage, string>> = {
 todo: { en: 'To do', ru: 'К выполнению' }, in_progress: { en: 'In progress', ru: 'В процессе' }, done: { en: 'Done', ru: 'Выполнено' }, overdue: { en: 'Overdue', ru: 'Просрочено' },
};
const PRIORITY_LABEL: Record<Priority, Record<AppLanguage, string>> = { low: { en: 'Low', ru: 'Низкий' }, medium: { en: 'Medium', ru: 'Средний' }, high: { en: 'High', ru: 'Высокий' } };
export function StatusBadge({ status, language = 'en' }: { status: Status; language?: AppLanguage }) { return <span className={'badge status-' + status}>{STATUS_LABEL[status][language]}</span>; }
export function PriorityBadge({ priority, language = 'en' }: { priority: Priority; language?: AppLanguage }) { return <span className={'badge priority-' + priority}><span className="dot" aria-hidden="true" />{PRIORITY_LABEL[priority][language]}</span>; }
