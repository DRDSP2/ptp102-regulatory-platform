import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import Login from '../features/login/Login';
import Dashboard from '../features/dashboard/Dashboard';

export function App() {
  const { status, role } = useAuth();

  if (status === 'loading') {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-100">
        <div className="text-sm tracking-wide">PTP-102 Regulatory Platform — Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          status === 'authenticated' ? (
            <Dashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
