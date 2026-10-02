import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { fmtTime } from './Result';

export default function History() {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/attempts/mine').then((r) => setList(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  if (error) return <div className="alert">{error}</div>;
  if (!list) return <p className="center-note">Loading…</p>;

  const best = list.length ? Math.max(...list.map((x) => x.percentage)) : 0;
  const avg = list.length ? Math.round(list.reduce((s, x) => s + x.percentage, 0) / list.length) : 0;

  return (
    <>
      <h1>My attempts</h1>
      {list.length === 0 ? (
        <div className="panel empty">You haven't taken a quiz yet. <Link to="/">Start one</Link>.</div>
      ) : (
        <>
          <div className="stat-row">
            <div className="panel stat"><b>{list.length}</b><span>attempts</span></div>
            <div className="panel stat"><b>{best}%</b><span>best score</span></div>
            <div className="panel stat"><b>{avg}%</b><span>average</span></div>
          </div>
          <div className="panel table-wrap">
            <table>
              <thead>
                <tr><th>Quiz</th><th>Score</th><th>%</th><th>Time</th><th>Date</th><th></th></tr>
              </thead>
              <tbody>
                {list.map((x) => (
                  <tr key={x._id}>
                    <td>{x.quizTitle}</td>
                    <td>{x.score} / {x.total}</td>
                    <td>{x.percentage}%</td>
                    <td>{fmtTime(x.timeTakenSec)}</td>
                    <td>{new Date(x.submittedAt).toLocaleString()}</td>
                    <td><Link to={`/result/${x._id}`}>Review</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
