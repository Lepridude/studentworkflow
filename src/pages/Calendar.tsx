import { useEffect, useMemo, useState, type FormEvent, type CSSProperties } from 'react';
import type { AppLanguage } from '../settings';
import type { CalendarCategory, CalendarEvent, CalendarEventInput, CalendarPriority, RepeatRule } from '../types/calendar';
import { loadCalendarEvents, saveCalendarEvents } from '../calendarStorage';
import { removeTaskForCalendarEvent, syncCalendarEventToTask, syncCalendarEventsToTasks } from '../taskCalendarSync';

type Props = { now: Date; language: AppLanguage };
type View = 'month' | 'week' | 'day' | 'agenda';
const DAY = 86400000;
const pad = (n: number) => String(n).padStart(2, '0');
const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const localInput = (d: Date) => `${dateKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const monday = (d: Date) => addDays(startOfDay(d), (d.getDay() + 6) % 7 * -1);
const uid = () => typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `event_${Date.now()}_${Math.random().toString(36).slice(2)}`;
const categoryColors: Record<CalendarCategory, string> = { study: '#4f46e5', deadline: '#dc2626', exam: '#d97706', work: '#0891b2', personal: '#16a34a', other: '#64748b' };
const labels = {
  ru: { title: 'Календарь', subtitle: 'Расписание, дедлайны и личные события в одном месте.', add: 'Добавить событие', today: 'Сегодня', month: 'Месяц', week: 'Неделя', day: 'День', agenda: 'Повестка', search: 'Поиск событий…', all: 'Все категории', deadlines: 'Только дедлайны', priority: 'Приоритет', allPriorities: 'Любой приоритет', subjectFilter: 'Все предметы', statusFilter: 'Все статусы', active: 'Предстоит', completed: 'Выполнено', empty: 'На этот период событий нет.', edit: 'Редактировать событие', create: 'Новое событие', name: 'Название', desc: 'Описание', start: 'Начало', end: 'Окончание', category: 'Категория', subject: 'Предмет', location: 'Место', reminder: 'Напоминание', repeat: 'Повтор', color: 'Цвет', low: 'Низкий', medium: 'Средний', high: 'Высокий', save: 'Сохранить', cancel: 'Отмена', delete: 'Удалить', confirmDelete: 'Удалить это событие?', done: 'Выполнено', markDone: 'Отметить выполненным', study: 'Учёба', deadline: 'Дедлайн', exam: 'Экзамен', work: 'Работа', personal: 'Личное', other: 'Другое', none: 'Нет', min15: 'За 15 минут', hour1: 'За 1 час', day1: 'За 1 день', day3: 'За 3 дня', custom: 'Своё время', daily: 'Ежедневно', weekly: 'Еженедельно', monthly: 'Ежемесячно', repeatNone: 'Не повторять', permission: 'Включить уведомления', permissionHint: 'Напоминания работают, пока StudentFlow открыт. Для уведомлений разрешите доступ браузеру.', export: 'Экспорт .ics', import: 'Импорт .ics', importError: 'Не удалось прочитать файл календаря.', savedError: 'Не удалось сохранить данные в браузере.', dueSoon: 'Скоро', overdue: 'Просрочено', upcoming: 'Предстоящие события', hours: 'час', customMinutes: 'Минут до события' },
  en: { title: 'Calendar', subtitle: 'Classes, deadlines and personal events in one place.', add: 'Add event', today: 'Today', month: 'Month', week: 'Week', day: 'Day', agenda: 'Agenda', search: 'Search events…', all: 'All categories', deadlines: 'Deadlines only', priority: 'Priority', allPriorities: 'Any priority', subjectFilter: 'All subjects', statusFilter: 'All statuses', active: 'Upcoming', completed: 'Completed', empty: 'No events in this period.', edit: 'Edit event', create: 'New event', name: 'Title', desc: 'Description', start: 'Start', end: 'End', category: 'Category', subject: 'Subject', location: 'Location', reminder: 'Reminder', repeat: 'Repeat', color: 'Color', low: 'Low', medium: 'Medium', high: 'High', save: 'Save', cancel: 'Cancel', delete: 'Delete', confirmDelete: 'Delete this event?', done: 'Completed', markDone: 'Mark as completed', study: 'Study', deadline: 'Deadline', exam: 'Exam', work: 'Work', personal: 'Personal', other: 'Other', none: 'None', min15: '15 minutes before', hour1: '1 hour before', day1: '1 day before', day3: '3 days before', custom: 'Custom', daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', repeatNone: 'Does not repeat', permission: 'Enable notifications', permissionHint: 'Reminders run while StudentFlow is open. Allow browser notifications to receive them.', export: 'Export .ics', import: 'Import .ics', importError: 'Could not read the calendar file.', savedError: 'Could not save data in this browser.', dueSoon: 'Due soon', overdue: 'Overdue', upcoming: 'Upcoming events', hours: 'hour', customMinutes: 'Minutes before event' }
};
const categoryName = (c: CalendarCategory, t: typeof labels.ru) => t[c];
const formatDay = (d: Date, lang: AppLanguage, opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric' }) => d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', opts);
const eventStart = (e: CalendarEvent) => new Date(e.start);
const eventEnd = (e: CalendarEvent) => new Date(e.end);
function occurrences(events: CalendarEvent[], from: Date, to: Date): { event: CalendarEvent; start: Date; end: Date }[] {
  const result: { event: CalendarEvent; start: Date; end: Date }[] = [];
  for (const event of events) {
    const base = eventStart(event); const finish = eventEnd(event); const duration = finish.getTime() - base.getTime();
    if (event.repeat === 'none') {
      if (finish >= from && base < to) result.push({ event, start: base, end: finish });
      continue;
    }
    let cursor = new Date(base);
    const monthDay = base.getDate();
    if (cursor < from) {
      if (event.repeat === 'daily') {
        const jumps = Math.max(0, Math.floor((from.getTime() - cursor.getTime()) / DAY) - 1);
        cursor.setDate(cursor.getDate() + jumps);
      } else if (event.repeat === 'weekly') {
        const jumps = Math.max(0, Math.floor((from.getTime() - cursor.getTime()) / (7 * DAY)) - 1);
        cursor.setDate(cursor.getDate() + jumps * 7);
      } else {
        const months = Math.max(0, (from.getFullYear() - cursor.getFullYear()) * 12 + from.getMonth() - cursor.getMonth() - 1);
        const nextMonth = new Date(cursor.getFullYear(), cursor.getMonth() + months, 1);
        const lastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
        cursor = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), Math.min(monthDay, lastDay), base.getHours(), base.getMinutes());
      }
    }
    let guard = 0;
    while (cursor < to && guard++ < 500) {
      const end = new Date(cursor.getTime() + duration);
      if (end >= from) result.push({ event, start: new Date(cursor), end });
      if (event.repeat === 'daily') cursor.setDate(cursor.getDate() + 1);
      else if (event.repeat === 'weekly') cursor.setDate(cursor.getDate() + 7);
      else { const nextMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1); const lastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate(); cursor = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), Math.min(monthDay, lastDay), base.getHours(), base.getMinutes()); }
    }
  }
  return result.sort((a, b) => a.start.getTime() - b.start.getTime());
}
function icsEscape(s: string) { return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
function toICS(events: CalendarEvent[]) {
  const stamp = (s: string) => s.replace(/[-:]/g, '') + '00';
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//StudentFlow//Calendar//RU'];
  for (const e of events) {
    lines.push('BEGIN:VEVENT', `UID:${e.id}@studentflow`, `DTSTART:${stamp(e.start)}`, `DTEND:${stamp(e.end)}`, `SUMMARY:${icsEscape(e.title)}`, `DESCRIPTION:${icsEscape(e.description)}`, `CATEGORIES:${e.category}`, 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
function parseICS(text: string): CalendarEventInput[] {
  const unfolded = text.replace(/\r?\n[ \t]/g, '');
  const blocks = unfolded.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || [];
  const parseDate = (v: string) => {
    const m = v.match(/(\d{4})(\d{2})(\d{2})T?(\d{2})?(\d{2})?/);
    if (!m) return '';
    return `${m[1]}-${m[2]}-${m[3]}T${m[4] || '09'}:${m[5] || '00'}`;
  };
  return blocks.map((block): CalendarEventInput => {
    const get = (key: string) => block.match(new RegExp('^' + key + '(?:;[^:]*)?:(.*)$', 'm'))?.[1]?.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';') || '';
    const start = parseDate(get('DTSTART')); const end = parseDate(get('DTEND')) || start;
    const cat = get('CATEGORIES') as CalendarCategory;
    return { title: get('SUMMARY') || 'Event', description: get('DESCRIPTION'), start, end: end > start ? end : localInput(new Date(new Date(start).getTime() + 3600000)), category: ['study','deadline','exam','work','personal','other'].includes(cat) ? cat : 'other', priority: 'medium', color: categoryColors[cat] || categoryColors.other, location: get('LOCATION'), subject: '', reminder: 'none', repeat: 'none', completed: false };
  }).filter(e => e.start && e.end);
}

export default function CalendarPage({ now, language }: Props) {
  const t = labels[language];
  const [events, setEvents] = useState<CalendarEvent[]>(loadCalendarEvents);
  const [view, setView] = useState<View>('month');
  const [cursor, setCursor] = useState(() => startOfDay(now));
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [onlyDeadlines, setOnlyDeadlines] = useState(false);
  const [query, setQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [notice, setNotice] = useState('');
  const [notificationEnabled, setNotificationEnabled] = useState(typeof Notification !== 'undefined' && Notification.permission === 'granted');
  const [customMinutes, setCustomMinutes] = useState('30');
  const [importInput, setImportInput] = useState<HTMLInputElement | null>(null);

  useEffect(() => { if (!saveCalendarEvents(events)) setNotice(t.savedError); }, [events, t.savedError]);
  useEffect(() => {
    const synced = syncCalendarEventsToTasks(events);
    if (synced.some((event, index) => event.linkedTaskId !== events[index]?.linkedTaskId)) setEvents(synced);
  }, [events]);
  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const notified = new Set<string>();
    const check = () => {
      const current = new Date();
      const upcoming = occurrences(events, new Date(current.getTime() - 4 * DAY), new Date(current.getTime() + 2 * DAY));
      for (const item of upcoming) {
        const event = item.event;
        if (event.completed || event.reminder === 'none') continue;
        const minutes = event.reminder === 'custom' ? event.customReminderMinutes || 30 : Number(event.reminder);
        const trigger = item.start.getTime() - minutes * 60000;
        const key = event.id + ':' + item.start.toISOString();
        if (!notified.has(key) && current.getTime() >= trigger && current.getTime() < trigger + 60000) {
          new Notification(event.title, { body: event.description || (language === 'ru' ? 'Скоро начнётся событие' : 'Your event starts soon') });
          notified.add(key);
        }
      }
    };
    check();
    const id = window.setInterval(check, 30000);
    return () => window.clearInterval(id);
  }, [events, language]);

  const range = useMemo(() => {
    if (view === 'month') {
      const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      const from = monday(first); return { from, to: addDays(from, 42) };
    }
    if (view === 'week') { const from = monday(cursor); return { from, to: addDays(from, 7) }; }
    if (view === 'day') { const from = startOfDay(cursor); return { from, to: addDays(from, 1) }; }
    return { from: startOfDay(now), to: addDays(startOfDay(now), 60) };
  }, [view, cursor, now]);
  const visible = useMemo(() => occurrences(events, range.from, range.to).filter(({ event }) => {
    if (categoryFilter !== 'all' && event.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && event.priority !== priorityFilter) return false;
    if (subjectFilter !== 'all' && event.subject !== subjectFilter) return false;
    if (statusFilter === 'completed' && !event.completed) return false;
    if (statusFilter === 'active' && event.completed) return false;
    if (statusFilter === 'overdue' && (event.completed || event.category !== 'deadline' || new Date(event.start) >= now)) return false;
    if (onlyDeadlines && event.category !== 'deadline') return false;
    if (query && !(event.title + ' ' + event.description + ' ' + event.subject).toLowerCase().includes(query.toLowerCase())) return false;
    const day = dateKey(new Date(event.start));
    if (dateFrom && day < dateFrom) return false;
    if (dateTo && day > dateTo) return false;
    return true;
  }), [events, range, categoryFilter, priorityFilter, subjectFilter, statusFilter, onlyDeadlines, query, dateFrom, dateTo, now]);
  const title = view === 'month'
    ? cursor.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { month: 'long', year: 'numeric' })
    : view === 'week' ? `${formatDay(range.from, language, { day: 'numeric', month: 'short' })} — ${formatDay(addDays(range.to, -1), language, { day: 'numeric', month: 'short', year: 'numeric' })}`
    : view === 'day' ? formatDay(cursor, language, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : t.upcoming;

  function shift(direction: number) {
    if (view === 'month') setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + direction, 1));
    else if (view === 'week') setCursor(addDays(cursor, direction * 7));
    else if (view === 'day') setCursor(addDays(cursor, direction));
    else setCursor(addDays(cursor, direction * 7));
  }
  function openNew(date = cursor) {
    const start = new Date(date); start.setHours(9, 0, 0, 0);
    const end = new Date(start); end.setHours(end.getHours() + 1);
    setEditing({ id: '', title: '', description: '', start: localInput(start), end: localInput(end), category: 'study', priority: 'medium', color: categoryColors.study, location: '', subject: '', reminder: 'none', repeat: 'none', completed: false, createdAt: '' });
    setModalOpen(true);
  }
  function saveEvent(input: CalendarEventInput) {
    if (!input.title.trim() || !input.start || !input.end || new Date(input.end) <= new Date(input.start)) { setNotice(language === 'ru' ? 'Проверьте название и время события.' : 'Check the event title and time.'); return; }
    if (editing?.id) {
      const linked = syncCalendarEventToTask({ ...editing, ...input });
      setEvents(prev => prev.map(e => e.id === editing.id ? linked : e));
    } else {
      const created: CalendarEvent = { ...input, id: uid(), createdAt: new Date().toISOString() };
      const linked = syncCalendarEventToTask(created);
      setEvents(prev => [...prev, linked]);
    }
    setModalOpen(false); setEditing(null); setNotice('');
  }
  function deleteEvent(event: CalendarEvent) {
    if (!window.confirm(t.confirmDelete)) return;
    removeTaskForCalendarEvent(event);
    setEvents(prev => prev.filter(e => e.id !== event.id)); setModalOpen(false); setEditing(null);
  }
  function toggleDone(id: string) { setEvents(prev => prev.map(e => e.id === id ? { ...e, completed: !e.completed } : e)); }
  function moveEvent(id: string, day: Date) {
    setEvents(prev => prev.map(e => {
      if (e.id !== id) return e;
      const old = eventStart(e); const next = new Date(day); next.setHours(old.getHours(), old.getMinutes(), 0, 0);
      const end = new Date(next.getTime() + (eventEnd(e).getTime() - old.getTime()));
      return { ...e, start: localInput(next), end: localInput(end) };
    }));
  }
  async function enableNotifications() {
    if (!('Notification' in window)) { setNotice(language === 'ru' ? 'Этот браузер не поддерживает уведомления.' : 'This browser does not support notifications.'); return; }
    const permission = await Notification.requestPermission();
    setNotificationEnabled(permission === 'granted');
  }
  function exportICS() {
    const blob = new Blob([toICS(events)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'studentflow-calendar.ics'; a.click(); URL.revokeObjectURL(url);
  }
  async function importICS(file?: File) {
    if (!file) return;
    try {
      const imported = parseICS(await file.text());
      if (!imported.length) throw new Error('No events');
      const linked = imported.map(e => syncCalendarEventToTask({ ...e, id: uid(), createdAt: new Date().toISOString() }));
      setEvents(prev => [...prev, ...linked]);
      setNotice(language === 'ru' ? `Импортировано событий: ${imported.length}` : `Imported events: ${imported.length}`);
    } catch { setNotice(t.importError); }
  }

  const subjects = Array.from(new Set(events.map(e => e.subject.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  const dayNames = Array.from({ length: 7 }, (_, i) => formatDay(addDays(monday(cursor), i), language, { weekday: 'short' }));
  const weekDays = Array.from({ length: view === 'day' ? 1 : 7 }, (_, i) => addDays(view === 'day' ? cursor : range.from, i));
  const eventForDay = (day: Date) => visible.filter(x => dateKey(x.start) === dateKey(day));
  const renderEvent = (item: { event: CalendarEvent; start: Date; end: Date }) => (
    <button key={item.event.id + item.start.toISOString()} type="button" className={`cal-event ${item.event.completed ? 'is-completed' : ''}`} style={{ '--event-color': item.event.color || categoryColors[item.event.category] } as CSSProperties}
      onClick={() => { setEditing(item.event); setModalOpen(true); }} draggable onDragStart={e => e.dataTransfer.setData('text/event-id', item.event.id)}>
      <span className="cal-event-time">{item.start.toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
      <span className="cal-event-name">{item.event.title}</span>{item.event.category === 'deadline' && <span className="cal-event-tag">{item.event.completed ? t.done : item.start.getTime() < now.getTime() ? t.overdue : item.start.getTime() - now.getTime() < DAY ? t.dueSoon : t.deadline}</span>}
    </button>
  );

  return <div className="page calendar-page">
    <div className="page-head calendar-heading"><div><h1>{t.title}</h1><p className="muted">{t.subtitle}</p></div><button className="btn btn-primary" onClick={() => openNew()}>{t.add}</button></div>
    <section className="card calendar-shell">
      <div className="calendar-toolbar">
        <div className="calendar-period"><button className="btn" onClick={() => shift(-1)} aria-label="Previous period">‹</button><button className="btn" onClick={() => setCursor(startOfDay(now))}>{t.today}</button><button className="btn" onClick={() => shift(1)} aria-label="Next period">›</button><h2>{title}</h2></div>
        <input className="calendar-jump" aria-label={language === 'ru' ? 'Перейти к дате' : 'Go to date'} type="date" value={dateKey(cursor)} onChange={e => { if (e.target.value) setCursor(fromKey(e.target.value)); }} />
        <div className="calendar-views">{(['month','week','day','agenda'] as View[]).map(v => <button key={v} className={view === v ? 'selected' : ''} onClick={() => setView(v)}>{t[v]}</button>)}</div>
      </div>
      <div className="calendar-filters">
        <input className="calendar-search" value={query} onChange={e => setQuery(e.target.value)} placeholder={t.search} />
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}><option value="all">{t.all}</option>{(['study','deadline','exam','work','personal','other'] as CalendarCategory[]).map(c => <option key={c} value={c}>{categoryName(c, t)}</option>)}</select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} aria-label={t.priority}><option value="all">{t.allPriorities}</option><option value="high">{t.high}</option><option value="medium">{t.medium}</option><option value="low">{t.low}</option></select>
        <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} aria-label={t.subjectFilter}><option value="all">{t.subjectFilter}</option>{subjects.map(s => <option key={s} value={s}>{s}</option>)}</select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label={t.statusFilter}><option value="all">{t.statusFilter}</option><option value="active">{t.active}</option><option value="completed">{t.completed}</option><option value="overdue">{t.overdue}</option></select>
        <label className="calendar-check"><input type="checkbox" checked={onlyDeadlines} onChange={e => setOnlyDeadlines(e.target.checked)} />{t.deadlines}</label>
        <input aria-label={language === 'ru' ? 'Дата с' : 'Date from'} type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <input aria-label={language === 'ru' ? 'Дата по' : 'Date to'} type="date" min={dateFrom || undefined} value={dateTo} onChange={e => setDateTo(e.target.value)} />
      </div>
      {notice && <p className="calendar-notice" role="status">{notice}</p>}
      {view === 'month' && <div className="month-grid">
        {dayNames.map(d => <div className="month-weekday" key={d}>{d}</div>)}
        {Array.from({ length: 42 }, (_, i) => addDays(range.from, i)).map(day => {
          const items = eventForDay(day); const outside = day.getMonth() !== cursor.getMonth();
          return <div key={dateKey(day)} className={`month-cell ${outside ? 'outside' : ''} ${dateKey(day) === dateKey(now) ? 'is-today' : ''}`} onDragOver={e => e.preventDefault()} onDrop={e => { const id = e.dataTransfer.getData('text/event-id'); if (id) moveEvent(id, day); }}>
            <button className="month-date" onClick={() => { setCursor(day); setView('day'); }}>{day.getDate()}</button>
            <div className="month-events">{items.slice(0, 3).map(item => renderEvent(item))}{items.length > 3 && <span className="more-events">+{items.length - 3}</span>}</div>
            <button className="cell-add" aria-label={language === 'ru' ? 'Добавить событие' : 'Add event'} onClick={() => openNew(day)}>+</button>
          </div>;
        })}
      </div>}
      {(view === 'week' || view === 'day') && <div className="time-grid-wrap"><div className="time-grid" style={{ '--day-count': weekDays.length } as React.CSSProperties}>
        <div className="time-head"><span />{weekDays.map(d => <div className={dateKey(d) === dateKey(now) ? 'today-head' : ''} key={dateKey(d)}>{formatDay(d, language, { weekday: 'short', day: 'numeric' })}</div>)}</div>
        <div className="time-body"><div className="time-labels">{Array.from({ length: 24 }, (_, i) => <div key={i}>{pad(i)}:00</div>)}</div>
          {weekDays.map(day => <div className="time-day" key={dateKey(day)} onDragOver={e => e.preventDefault()} onDrop={e => { const id = e.dataTransfer.getData('text/event-id'); if (id) moveEvent(id, day); }}>
            {Array.from({ length: 15 }, (_, i) => <button className="time-slot" key={i} aria-label={`${dateKey(day)} ${i + 7}:00`} onClick={() => { const d = new Date(day); d.setHours(i + 7, 0, 0, 0); openNew(d); }} />)}
            {eventForDay(day).map(item => { const top = (item.start.getHours() + item.start.getMinutes() / 60) * 56; const height = Math.max(28, (item.end.getTime() - item.start.getTime()) / 3600000 * 56); return <div key={item.event.id + item.start.toISOString()} className="time-event" style={{ top: `${top}px`, height: `${height}px`, '--event-color': item.event.color } as React.CSSProperties}>{renderEvent(item)}</div>; })}
          </div>)}
        </div>
      </div></div>}
      {view === 'agenda' && <div className="agenda-list">{visible.map(item => <div className={`agenda-row ${item.event.completed ? 'is-completed' : ''}`} key={item.event.id + item.start.toISOString()}><div className="agenda-date">{formatDay(item.start, language, { weekday: 'short', day: 'numeric', month: 'short' })}<span>{item.start.toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span></div><div className="agenda-details"><button onClick={() => { setEditing(item.event); setModalOpen(true); }} className={`agenda-title ${item.event.completed ? 'is-completed' : ''}`}>{item.event.title}</button><p>{categoryName(item.event.category, t)}{item.event.subject ? ' · ' + item.event.subject : ''}{item.event.location ? ' · ' + item.event.location : ''}</p>{item.event.description && <small>{item.event.description}</small>}</div><label className="agenda-done"><input type="checkbox" checked={item.event.completed} onChange={() => toggleDone(item.event.id)} />{item.event.completed ? t.done : ''}</label></div>)}{visible.length === 0 && <p className="empty">{t.empty}</p>}</div>}
      {(view === 'month' || view === 'week' || view === 'day') && visible.length === 0 && <p className="empty calendar-empty">{t.empty}</p>}
      <div className="calendar-footer"><div className="calendar-legend">{(['study','deadline','exam','work','personal','other'] as CalendarCategory[]).map(c => <span key={c}><i style={{ background: categoryColors[c] }} />{categoryName(c, t)}</span>)}</div><div className="calendar-tools"><button className="btn" onClick={exportICS}>{t.export}</button><button className="btn" onClick={() => importInput?.click()}>{t.import}</button><input ref={setImportInput} type="file" accept=".ics,text/calendar" hidden onChange={e => { void importICS(e.target.files?.[0]); e.currentTarget.value = ''; }} /><button className="btn" onClick={() => void enableNotifications()}>{notificationEnabled ? '✓ ' : ''}{t.permission}</button></div></div>
      <p className="calendar-hint">{t.permissionHint}</p>
    </section>
    {modalOpen && editing && <EventModal event={editing} language={language} customMinutes={customMinutes} setCustomMinutes={setCustomMinutes} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={saveEvent} onDelete={() => deleteEvent(editing)} />}
  </div>;
}

type ModalProps = { event: CalendarEvent; language: AppLanguage; customMinutes: string; setCustomMinutes: (v: string) => void; onClose: () => void; onSave: (v: CalendarEventInput) => void; onDelete: () => void };
function EventModal({ event, language, customMinutes, setCustomMinutes, onClose, onSave, onDelete }: ModalProps) {
  const t = labels[language];
  const [value, setValue] = useState<CalendarEventInput>({ title: event.title, description: event.description, start: event.start, end: event.end, category: event.category, priority: event.priority, color: event.color, location: event.location, subject: event.subject, reminder: event.reminder, customReminderMinutes: event.customReminderMinutes, repeat: event.repeat, completed: event.completed, linkedTaskId: event.linkedTaskId });
  const set = <K extends keyof CalendarEventInput>(key: K, next: CalendarEventInput[K]) => setValue(old => ({ ...old, [key]: next }));
  const submit = (e: FormEvent) => { e.preventDefault(); onSave(value); };
  return <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="modal calendar-modal" role="dialog" aria-modal="true"><div className="modal-head"><h2>{event.id ? t.edit : t.create}</h2><button className="icon-btn" onClick={onClose} aria-label="Close">×</button></div>
    <form onSubmit={submit}><label className="field"><span>{t.name}</span><input required maxLength={120} autoFocus value={value.title} onChange={e => set('title', e.target.value)} /></label>
    <label className="field"><span>{t.desc}</span><textarea rows={2} value={value.description} onChange={e => set('description', e.target.value)} /></label>
    <div className="field-row"><label className="field"><span>{t.start}</span><input required type="datetime-local" value={value.start} onChange={e => set('start', e.target.value)} /></label><label className="field"><span>{t.end}</span><input required type="datetime-local" min={value.start} value={value.end} onChange={e => set('end', e.target.value)} /></label></div>
    <div className="field-row"><label className="field"><span>{t.category}</span><select value={value.category} onChange={e => { const c = e.target.value as CalendarCategory; set('category', c); set('color', categoryColors[c]); }}><option value="study">{t.study}</option><option value="deadline">{t.deadline}</option><option value="exam">{t.exam}</option><option value="work">{t.work}</option><option value="personal">{t.personal}</option><option value="other">{t.other}</option></select></label><label className="field"><span>{t.priority}</span><select value={value.priority} onChange={e => set('priority', e.target.value as CalendarPriority)}><option value="low">{t.low}</option><option value="medium">{t.medium}</option><option value="high">{t.high}</option></select></label></div>
    <div className="field-row"><label className="field"><span>{t.subject}</span><input value={value.subject} onChange={e => set('subject', e.target.value)} /></label><label className="field"><span>{t.location}</span><input value={value.location} onChange={e => set('location', e.target.value)} /></label></div>
    <div className="field-row"><label className="field"><span>{t.reminder}</span><select value={value.reminder} onChange={e => set('reminder', e.target.value as CalendarEventInput['reminder'])}><option value="none">{t.none}</option><option value="15">{t.min15}</option><option value="60">{t.hour1}</option><option value="1440">{t.day1}</option><option value="4320">{t.day3}</option><option value="custom">{t.custom}</option></select></label><label className="field"><span>{t.repeat}</span><select value={value.repeat} onChange={e => set('repeat', e.target.value as RepeatRule)}><option value="none">{t.repeatNone}</option><option value="daily">{t.daily}</option><option value="weekly">{t.weekly}</option><option value="monthly">{t.monthly}</option></select></label></div>
    {value.reminder === 'custom' && <label className="field"><span>{t.customMinutes}</span><input type="number" min="1" max="10080" value={customMinutes} onChange={e => setCustomMinutes(e.target.value)} onBlur={() => set('customReminderMinutes', Math.max(1, Number(customMinutes) || 30))} /></label>}
    <label className="field color-field"><span>{t.color}</span><input type="color" value={value.color} onChange={e => set('color', e.target.value)} /></label>
    <label className="calendar-complete"><input type="checkbox" checked={value.completed} onChange={e => set('completed', e.target.checked)} />{t.markDone}</label>
    <div className="modal-actions">{event.id && <button type="button" className="btn btn-danger" onClick={onDelete}>{t.delete}</button>}<span className="modal-spacer" /><button type="button" className="btn" onClick={onClose}>{t.cancel}</button><button type="submit" className="btn btn-primary">{t.save}</button></div>
    </form></div></div>;
}
