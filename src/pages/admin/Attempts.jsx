import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api';
import { fmtTime } from '../Result';

export default function Attempts() {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/attempts').then((r) => setList(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  if (error) return <div className="alert">{error}</div>;
  if (!list) return <p className="center-note">Loading…</p>;
  if (!list.length) return <div className="panel empty">No attempts yet.</div>;

  return (
    <div className="panel table-wrap">
      <table>
        <thead><tr><th>User</th><th>Quiz</th><th>Score</th><th>%</th><th>Time</th><th>Date</th></tr></thead>
        <tbody>
          {list.map((x) => (
            <tr key={x._id}>
              <td>{x.user?.name || 'Deleted user'}<br /><span className="muted small">{x.user?.email}</span></td>
              <td>{x.quizTitle}</td>
              <td>{x.score} / {x.total}</td>
              <td>{x.percentage}%</td>
              <td>{fmtTime(x.timeTakenSec)}</td>
              <td>{new Date(x.submittedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
