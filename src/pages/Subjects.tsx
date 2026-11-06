import { useMemo, useState } from 'react';
import type { AppLanguage } from '../settings';
import { createSubject, deleteSubject, loadSubjects, updateSubject, type Subject } from '../subjects';

type Props = { language: AppLanguage };
const COLORS = ['#4f46e5', '#0891b2', '#16a34a', '#d97706', '#db2777', '#7c3aed', '#64748b'];

export default function SubjectsPage({ language }: Props) {
  const ru = language === 'ru';
  const [subjects, setSubjects] = useState<Subject[]>(loadSubjects);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const counts = useMemo(() => {
    const result = new Map<string, number>();
    for (const subject of subjects) result.set(subject.name, 0);
    return result;
  }, [subjects]);

  function resetForm() { setName(''); setColor(COLORS[0]); setEditingId(null); setError(''); }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const ok = editingId ? updateSubject(editingId, name, color) : Boolean(createSubject(name, color));
    if (!ok) {
      setError(ru ? 'Название пустое или такой предмет уже существует.' : 'Enter a unique subject name.');
      return;
    }
    setSubjects(loadSubjects());
    setNotice(ru ? 'Изменения сохранены.' : 'Changes saved.');
    resetForm();
  }
  function edit(subject: Subject) {
    setEditingId(subject.id); setName(subject.name); setColor(subject.color); setNotice(''); setError('');
  }
  function remove(subject: Subject) {
    const confirmed = window.confirm(ru ? `Удалить предмет «${subject.name}»? У задач и событий календаря предмет будет очищен.` : `Delete "${subject.name}"? Tasks and calendar events will keep their content but lose this subject.`);
    if (!confirmed) return;
    deleteSubject(subject.id);
    setSubjects(loadSubjects());
    if (editingId === subject.id) resetForm();
    setNotice(ru ? 'Предмет удалён.' : 'Subject deleted.');
  }

  return <div className="page">
    <div className="page-head"><h1>{ru ? 'Предметы' : 'Subjects'}</h1><p className="muted">{ru ? 'Единый список дисциплин для задач и календаря.' : 'One subject list for tasks and calendar events.'}</p></div>
    <section className="card subject-manager">
      <h2>{editingId ? (ru ? 'Изменить предмет' : 'Edit subject') : (ru ? 'Добавить предмет' : 'Add subject')}</h2>
      <form onSubmit={submit} className="subject-form">
        <label className="field"><span>{ru ? 'Название предмета' : 'Subject name'}</span><input maxLength={80} value={name} onChange={e => { setName(e.target.value); setError(''); }} placeholder={ru ? 'Например, математический анализ' : 'e.g. Calculus'} /></label>
        <label className="field subject-color"><span>{ru ? 'Цвет' : 'Color'}</span><input type="color" value={color} onChange={e => setColor(e.target.value)} /></label>
        <div className="subject-actions"><button className="btn btn-primary" type="submit">{editingId ? (ru ? 'Сохранить' : 'Save') : (ru ? 'Добавить' : 'Add')}</button>{editingId && <button className="btn" type="button" onClick={resetForm}>{ru ? 'Отмена' : 'Cancel'}</button>}</div>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      {notice && <p className="subject-notice" role="status">{notice}</p>}
    </section>
    <section className="card subject-list-card">
      <div className="card-head"><h2>{ru ? 'Мои предметы' : 'My subjects'}</h2><span className="muted">{subjects.length}</span></div>
      {subjects.length === 0 ? <p className="empty">{ru ? 'Пока нет предметов. Добавьте первый выше.' : 'No subjects yet. Add one above.'}</p> : <ul className="subject-list">{subjects.map(subject => <li key={subject.id} className="subject-row"><span className="subject-swatch" style={{ background: subject.color }} /><strong>{subject.name}</strong><span className="subject-spacer" /><button type="button" className="btn" onClick={() => edit(subject)}>{ru ? 'Изменить' : 'Edit'}</button><button type="button" className="icon-btn" onClick={() => remove(subject)} aria-label={ru ? 'Удалить ' + subject.name : 'Delete ' + subject.name}>×</button></li>)}</ul>}
    </section>
  </div>;
}
