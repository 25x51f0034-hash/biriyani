import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../api';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
export const fmtTime = (s = 0) => `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`;

export default function Result() {
  const { attemptId } = useParams();
  const [a, setA] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/attempts/${attemptId}`).then((r) => setA(r.data)).catch((e) => setError(errMsg(e)));
  }, [attemptId]);

  if (error) return <div className="alert">{error}</div>;
  if (!a) return <p className="center-note">Loading result…</p>;

  const wrong = a.answers.filter((x) => x.selected !== null && !x.isCorrect).length;
  const skipped = a.answers.filter((x) => x.selected === null).length;
  const verdict = a.percentage >= 80 ? 'Excellent work' : a.percentage >= 50 ? 'Good effort' : 'Keep practising';

  return (
    <>
      <section className="panel score-card">
        <div className="score-main">
          <p className="muted">{a.quizTitle}</p>
          <h1>{verdict}</h1>
          <p className="score-big">{a.score}<span> / {a.total}</span></p>
        </div>
        <dl className="score-stats">
          <div><dt>Percentage</dt><dd>{a.percentage}%</dd></div>
          <div><dt>Correct</dt><dd className="ok">{a.score}</dd></div>
          <div><dt>Wrong</dt><dd className="bad">{wrong}</dd></div>
          <div><dt>Skipped</dt><dd>{skipped}</dd></div>
          <div><dt>Time taken</dt><dd>{fmtTime(a.timeTakenSec)}</dd></div>
        </dl>
        <div className="q-actions">
          <Link className="btn" to="/">More quizzes</Link>
          <Link className="btn ghost" to="/history">All attempts</Link>
        </div>
      </section>

      <h2 className="section-title">Review</h2>
      {a.answers.map((x, n) => (
        <article className="panel review" key={x.question}>
          <p className="q-count">
            Question {n + 1} ·{' '}
            <span className={x.selected === null ? '' : x.isCorrect ? 'ok' : 'bad'}>
              {x.selected === null ? 'Skipped' : x.isCorrect ? 'Correct' : 'Incorrect'}
            </span>
          </p>
          <h3 className="q-text">{x.text}</h3>
          <ul className="rev-options">
            {x.options.map((o, i) => (
              <li key={i} className={i === x.correctIndex ? 'right' : i === x.selected ? 'wrong' : ''}>
                <span className="bubble sm">{LETTERS[i]}</span>
                <span>{o}</span>
                {i === x.correctIndex && <em>Correct answer</em>}
                {i === x.selected && i !== x.correctIndex && <em>Your answer</em>}
              </li>
            ))}
          </ul>
          {x.explanation && <p className="explain">{x.explanation}</p>}
        </article>
      ))}
    </>
  );
}
