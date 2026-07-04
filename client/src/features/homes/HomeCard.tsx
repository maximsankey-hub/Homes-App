import { useNavigate } from 'react-router-dom';
import type { PropertySummary } from 'shared';
import { Badge } from '../../components/common/Badge';
import { ScoreRing } from '../../components/common/ScoreRing';

function formatDate(iso: string | null): string {
  if (!iso) return 'Not visited';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function HomeCard({ property }: { property: PropertySummary }) {
  const navigate = useNavigate();

  return (
    <div className="hcard" onClick={() => navigate(`/buy/homes/${property.id}`)}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>{property.address}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            {property.city}, {property.state} · ${property.listingPrice.toLocaleString()}
          </div>
          <div className="pmeta">
            <span>{property.sqft.toLocaleString()} sqft</span>
            <span>·</span>
            <span>
              {property.beds} bd/{property.baths} ba
            </span>
            <span>·</span>
            <span>{formatDate(property.lastVisitedAt)}</span>
          </div>
        </div>
        <ScoreRing score={property.score} color={property.scoreColor} />
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {property.badges.map((b) => (
          <Badge key={b.text} {...b} />
        ))}
      </div>
    </div>
  );
}
