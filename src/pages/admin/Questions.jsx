import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../../api';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const blank = { text: '', options: ['', '', '', ''], correctIndex: 0, category: 'General', difficulty: 'medium', explanation: '' };

export default function Questions() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(() => {
    api.get('/questions', { params: { q: search || undefined } }).then((r) => setList(r.data)).catch((e) => setError(errMsg(e)));
  }, [search]);
  useEffect(load, [load]);

  const setOpt = (i, v) => setForm((f) => ({ ...f, options: f.options.map((o, k) => (k === i ? v : o)) }));
  const addOpt = () => form.options.length < 6 && setForm((f) => ({ ...f, options: [...f.options, ''] }));
  const removeOpt = (i) => {
    if (form.options.length <= 2) return;
    setForm((f) => ({
      ...f,
      options: f.options.filter((_, k) => k !== i),
      correctIndex: f.correctIndex === i ? 0 : f.correctIndex > i ? f.correctIndex - 1 : f.correctIndex,
    }));
  };

  const reset = () => { setForm(blank); setEditing(null); };

  const save = async (e) => {
    e.preventDefault();
    setError(''); setNotice('');
    if (form.options.some((o) => !o.trim())) return setError('Fill in every option or remove the empty ones.');
    try {
      if (editing) await api.put(`/questions/${editing}`, form);
      else await api.post('/questions', form);
      setNotice(editing ? 'Question updated.' : 'Question added to the bank.');
      reset();
      load();
    } catch (err) { setError(errMsg(err)); }
  };

  const edit = (q) => {
    setEditing(q._id);
    setForm({ text: q.text, options: q.options, correctIndex: q.correctIndex, category: q.category, difficulty: q.difficulty, explanation: q.explanation || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    if (!confirm('Delete this question? It will also disappear from quizzes that use it.')) return;
    await api.delete(`/questions/${id}`);
    load();
  };

  return (
    <div className="admin-grid">
      <form className="panel form" onSubmit={save}>
        <h2>{editing ? 'Edit question' : 'Add a question'}</h2>
        {error && <div className="alert">{error}</div>}
        {notice && <div className="note-ok">{notice}</div>}
        <label>Question<textarea rows={3} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} required /></label>

        <fieldset>
          <legend>Options (select the correct one)</legend>
          {form.options.map((o, i) => (
            <div className="opt-row" key={i}>
              <input type="radio" name="correct" checked={form.correctIndex === i} onChange={() => setForm({ ...form, correctIndex: i })} aria-label={`Option ${LETTERS[i]} is correct`} />
              <span className="bubble sm">{LETTERS[i]}</span>
              <input value={o} onChange={(e) => setOpt(i, e.target.value)} placeholder={`Option ${LETTERS[i]}`} />
              <button type="button" className="btn ghost sm" onClick={() => removeOpt(i)} disabled={form.options.length <= 2}>Remove</button>
            </div>
          ))}
          <button type="button" className="btn ghost sm" onClick={addOpt} disabled={form.options.length >= 6}>Add option</button>
        </fieldset>

        <div className="row2">
          <label>Category<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
          <label>Difficulty
            <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
            </select>
          </label>
        </div>
        <label>Explanation (shown after the quiz)<textarea rows={2} value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} /></label>
        <div className="q-actions">
          {editing && <button type="button" className="btn ghost" onClick={reset}>Cancel</button>}
          <button className="btn">{editing ? 'Save changes' : 'Add question'}</button>
        </div>
      </form>

      <section>
        <div className="list-head">
          <h2>{list.length} in the bank</h2>
          <input className="search" placeholder="Search questions" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {list.length === 0 && <div className="panel empty">No questions found.</div>}
        {list.map((q) => (
          <article className="panel qrow" key={q._id}>
            <div>
              <p className="q-text sm">{q.text}</p>
              <p className="muted small">
                <span className="tag">{q.category}</span> {q.difficulty} · correct: {LETTERS[q.correctIndex]}. {q.options[q.correctIndex]}
              </p>
            </div>
            <div className="row-actions">
              <button className="btn ghost sm" onClick={() => edit(q)}>Edit</button>
              <button className="btn danger sm" onClick={() => remove(q._id)}>Delete</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
