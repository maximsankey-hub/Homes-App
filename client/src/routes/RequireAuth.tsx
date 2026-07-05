import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function RequireAuth() {
  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) return <div className="pad">Loading…</div>;
  if (!session) return <Navigate to="/login" replace />;

  return <Outlet />;
}
