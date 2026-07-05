import { Navigate } from 'react-router-dom';
import { HomeCard } from '../features/homes/HomeCard';
import { useProperties } from '../features/homes/useProperties';

/** Tab-bar shortcut into Visit mode — lets the user pick which property they're visiting. */
export function VisitEntry() {
  const { data, isLoading } = useProperties();

  if (isLoading) return <div className="pad">Loading…</div>;
  if (!data || data.length === 0) return <Navigate to="/buy/homes" replace />;
  if (data.length === 1) return <Navigate to={`/buy/visit/${data[0].id}`} replace />;

  return (
    <div className="pad">
      <div className="slbl">Which home are you visiting?</div>
      {data.map((property) => (
        <HomeCard key={property.id} property={property} to={`/buy/visit/${property.id}`} />
      ))}
    </div>
  );
}
