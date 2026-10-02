import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/quizzes').then((r) => setQuizzes(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  return (
    <>
      <h1>Pick a quiz, {user.name.split(' ')[0]}</h1>
      <p className="muted lead">Each quiz has its own countdown. When it hits zero, your answers are submitted automatically.</p>
      {error && <div className="alert">{error}</div>}
      {!quizzes && !error && <p className="center-note">Loading quizzes…</p>}
      {quizzes && quizzes.length === 0 && (
        <div className="panel empty">
          No quizzes yet.{user.role === 'admin' ? <> Add some from the <Link to="/admin">admin page</Link>.</> : ' Check back soon.'}
        </div>
      )}
      <div className="quiz-list">
        {quizzes?.map((q) => (
          <article className="panel quiz-card" key={q._id}>
            <div>
              <span className="tag">{q.category}</span>
              <h2>{q.title}</h2>
              <p className="muted">{q.description || 'No description.'}</p>
            </div>
            <div className="quiz-meta">
              <span><b>{q.questionCount}</b> questions</span>
              <span><b>{q.durationMinutes}</b> min</span>
              {q.questionCount > 0 ? (
                <Link className="btn sm" to={`/quiz/${q._id}`}>Start</Link>
              ) : (
                <span className="muted small">No questions</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
