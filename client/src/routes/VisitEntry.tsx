import { Navigate } from 'react-router-dom';
import { useProperties } from '../features/homes/useProperties';

/** Tab-bar shortcut into Visit mode — defaults to the first tracked property. */
export function VisitEntry() {
  const { data, isLoading } = useProperties();

  if (isLoading) return <div className="pad">Loading…</div>;
  if (!data || data.length === 0) return <Navigate to="/buy/homes" replace />;

  return <Navigate to={`/buy/visit/${data[0].id}`} replace />;
}
