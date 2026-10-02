import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../../api';

const blank = { title: '', description: '', category: 'General', durationMinutes: 10, questions: [], isActive: true };

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [bank, setBank] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(() => {
    api.get('/quizzes').then((r) => setQuizzes(r.data)).catch((e) => setError(errMsg(e)));
    api.get('/questions').then((r) => setBank(r.data)).catch(() => {});
  }, []);
  useEffect(load, [load]);

  const categories = [...new Set(bank.map((q) => q.category))];
  const visible = bank.filter((q) => !filter || q.category === filter);
  const toggle = (id) =>
    setForm((f) => ({ ...f, questions: f.questions.includes(id) ? f.questions.filter((x) => x !== id) : [...f.questions, id] }));

  const reset = () => { setForm(blank); setEditing(null); };

  const save = async (e) => {
    e.preventDefault();
    setError(''); setNotice('');
    if (!form.questions.length) return setError('Select at least one question.');
    try {
      if (editing) await api.put(`/quizzes/${editing}`, form);
      else await api.post('/quizzes', form);
      setNotice(editing ? 'Quiz updated.' : 'Quiz created.');
      reset(); load();
    } catch (err) { setError(errMsg(err)); }
  };

  const edit = (q) => {
    setEditing(q._id);
    setForm({ title: q.title, description: q.description, category: q.category, durationMinutes: q.durationMinutes, questions: q.questionIds || [], isActive: q.isActive });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    if (!confirm('Delete this quiz? Past attempts are kept.')) return;
    await api.delete(`/quizzes/${id}`);
    load();
  };

  const flip = async (q) => {
    await api.put(`/quizzes/${q._id}`, { ...q, questions: q.questionIds, isActive: !q.isActive });
    load();
  };

  return (
    <div className="admin-grid">
      <form className="panel form" onSubmit={save}>
        <h2>{editing ? 'Edit quiz' : 'Create a quiz'}</h2>
        {error && <div className="alert">{error}</div>}
        {notice && <div className="note-ok">{notice}</div>}
        <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
        <label>Description<textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <div className="row2">
          <label>Category<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
          <label>Time limit (minutes)<input type="number" min={1} max={240} value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} required /></label>
        </div>
        <label className="check"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Visible to users</label>

        <fieldset>
          <legend>Questions ({form.questions.length} selected)</legend>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by category">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <div className="pick-list">
            {visible.length === 0 && <p className="muted small">The question bank is empty. Add questions first.</p>}
            {visible.map((q) => (
              <label className="check" key={q._id}>
                <input type="checkbox" checked={form.questions.includes(q._id)} onChange={() => toggle(q._id)} />
                <span>{q.text}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="q-actions">
          {editing && <button type="button" className="btn ghost" onClick={reset}>Cancel</button>}
          <button className="btn">{editing ? 'Save quiz' : 'Create quiz'}</button>
        </div>
      </form>

      <section>
        <h2>{quizzes.length} quizzes</h2>
        {quizzes.length === 0 && <div className="panel empty">No quizzes yet.</div>}
        {quizzes.map((q) => (
          <article className="panel qrow" key={q._id}>
            <div>
              <p className="q-text sm">{q.title} {!q.isActive && <span className="tag off">Hidden</span>}</p>
              <p className="muted small">{q.category} · {q.questionCount} questions · {q.durationMinutes} min</p>
            </div>
            <div className="row-actions">
              <button className="btn ghost sm" onClick={() => flip(q)}>{q.isActive ? 'Hide' : 'Show'}</button>
              <button className="btn ghost sm" onClick={() => edit(q)}>Edit</button>
              <button className="btn danger sm" onClick={() => remove(q._id)}>Delete</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
