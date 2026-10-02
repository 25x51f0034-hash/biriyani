import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const offset = useRef(0); // server clock minus client clock
  const submitted = useRef(false);
  const started = useRef(false); // guards against React StrictMode double-invoking the effect

  // start or resume
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    api
      .post(`/quizzes/${id}/start`)
      .then(({ data }) => {
        offset.current = new Date(data.serverNow).getTime() - Date.now();
        setSession(data);
        setAnswers(data.saved || {});
      })
      .catch((e) => setError(errMsg(e)));
  }, [id]);

  const submit = useCallback(async () => {
    if (submitted.current || !session) return;
    submitted.current = true;
    setSubmitting(true);
    try {
      const { data } = await api.put(`/attempts/${session.attemptId}/submit`, { answers });
      navigate(`/result/${data.attemptId}`, { replace: true });
    } catch (e) {
      submitted.current = false;
      setSubmitting(false);
      setError(errMsg(e));
    }
  }, [session, answers, navigate]);

  // countdown, driven by the server-issued end time
  useEffect(() => {
    if (!session) return;
    const end = new Date(session.endsAt).getTime();
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((end - (Date.now() + offset.current)) / 1000)));
    tick();
    const t = setInterval(tick, 500);
    return () => clearInterval(t);
  }, [session]);

  // auto-submit at zero
  useEffect(() => {
    if (secondsLeft === 0) submit();
  }, [secondsLeft, submit]);

  const choose = (questionId, idx) => {
    setAnswers((a) => ({ ...a, [questionId]: idx }));
    api.patch(`/attempts/${session.attemptId}/answer`, { questionId, selected: idx }).catch(() => {});
  };

  const answered = useMemo(() => Object.keys(answers).length, [answers]);

  if (error && !session) return <div className="alert">{error}</div>;
  if (!session) return <p className="center-note">Preparing your quiz…</p>;

  const q = session.questions[current];
  const total = session.questions.length;
  const low = secondsLeft !== null && secondsLeft <= 60;

  return (
    <div className="quiz-layout">
      <div className="quiz-top panel">
        <div>
          <h1 className="quiz-title">{session.title}</h1>
          <span className="muted small">{answered} of {total} answered</span>
        </div>
        <div className={`timer ${low ? 'low' : ''}`} role="timer" aria-live="off">
          {secondsLeft === null ? '--:--' : fmt(secondsLeft)}
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      <section className="panel question" key={q._id}>
        <p className="q-count">Question {current + 1} of {total}</p>
        <h2 className="q-text">{q.text}</h2>
        <div className="options" role="radiogroup" aria-label="Answer options">
          {q.options.map((opt, i) => (
            <button
              key={i}
              role="radio"
              aria-checked={answers[q._id] === i}
              className={`option ${answers[q._id] === i ? 'picked' : ''}`}
              onClick={() => choose(q._id, i)}
              disabled={submitting}
            >
              <span className="bubble">{LETTERS[i]}</span>
              <span>{opt}</span>
            </button>
          ))}
        </div>
        <div className="q-actions">
          <button className="btn ghost" onClick={() => setCurrent((c) => c - 1)} disabled={current === 0}>Previous</button>
          {current < total - 1 ? (
            <button className="btn" onClick={() => setCurrent((c) => c + 1)}>Next</button>
          ) : (
            <button className="btn" onClick={() => setConfirming(true)} disabled={submitting}>Finish quiz</button>
          )}
        </div>
      </section>

      <aside className="panel palette">
        <h3>Questions</h3>
        <div className="palette-grid">
          {session.questions.map((x, i) => (
            <button
              key={x._id}
              className={`pal ${i === current ? 'now' : ''} ${answers[x._id] !== undefined ? 'done' : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Question ${i + 1}${answers[x._id] !== undefined ? ', answered' : ''}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button className="btn block" onClick={() => setConfirming(true)} disabled={submitting}>Submit quiz</button>
      </aside>

      {confirming && (
        <div className="modal-back" onClick={() => setConfirming(false)}>
          <div className="modal panel" onClick={(e) => e.stopPropagation()}>
            <h2>Submit your answers?</h2>
            <p className="muted">
              You answered {answered} of {total} questions.
              {answered < total && ` ${total - answered} unanswered will count as zero.`} You can't change them after submitting.
            </p>
            <div className="q-actions">
              <button className="btn ghost" onClick={() => setConfirming(false)}>Keep working</button>
              <button className="btn" onClick={submit} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
