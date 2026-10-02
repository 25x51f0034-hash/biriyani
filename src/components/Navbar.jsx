import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="nav">
      <Link to="/" className="brand">
        <span className="brand-dot" aria-hidden="true" />
        QuizSheet
      </Link>
      {user && (
        <nav className="nav-links">
          <NavLink to="/" end>Quizzes</NavLink>
          <NavLink to="/history">My attempts</NavLink>
          {user.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        </nav>
      )}
      <div className="nav-user">
        {user ? (
          <>
            <span className="muted">{user.name}</span>
            <button className="btn ghost sm" onClick={() => { logout(); navigate('/login'); }}>
              Log out
            </button>
          </>
        ) : (
          <Link className="btn ghost sm" to="/login">Log in</Link>
        )}
      </div>
    </header>
  );
}
