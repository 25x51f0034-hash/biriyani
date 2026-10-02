import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import TakeQuiz from './pages/TakeQuiz';
import Result from './pages/Result';
import History from './pages/History';
import Admin from './pages/admin/Admin';

function Guard({ children, admin }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="center-note">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Guard><Home /></Guard>} />
          <Route path="/quiz/:id" element={<Guard><TakeQuiz /></Guard>} />
          <Route path="/result/:attemptId" element={<Guard><Result /></Guard>} />
          <Route path="/history" element={<Guard><History /></Guard>} />
          <Route path="/admin" element={<Guard admin><Admin /></Guard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
