import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { errMsg } from '../api';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="panel auth" onSubmit={submit}>
        <h1>Create your account</h1>
        <p className="muted">It takes a few seconds, then you can start your first quiz.</p>
        {error && <div className="alert">{error}</div>}
        <label>Name<input value={form.name} onChange={set('name')} required /></label>
        <label>Email<input type="email" value={form.email} onChange={set('email')} required /></label>
        <label>Password<input type="password" minLength={6} value={form.password} onChange={set('password')} required /></label>
        <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
        <p className="muted small">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
