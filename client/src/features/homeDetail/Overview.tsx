import { useNavigate, useParams } from 'react-router-dom';
import { AIInsightCard } from '../../components/common/AIInsightCard';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { ScoreRing } from '../../components/common/ScoreRing';
import { useProperty } from '../homes/useProperties';

export function Overview() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { data: property, isLoading, refetch, isFetching } = useProperty(propertyId);

  if (isLoading || !property) {
    return <div>Loading…</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <ScoreRing score={property.score} color={property.scoreColor} size={60} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{property.fitLabel}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{property.visitSummary}</div>
          <div style={{ marginTop: 5, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {property.badges.map((b) => (
              <Badge key={b.text} {...b} />
            ))}
          </div>
        </div>
      </div>

      <div className="pmg">
        {property.metrics.map((m) => (
          <div className="pmc" key={m.label}>
            <div className="v">{m.value}</div>
            <div className="l">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="ct" style={{ margin: 0 }}>
            AI insights
          </div>
          <span className="badge bb">
            <Icon name="ti-sparkles" size={10} /> Claude
          </span>
        </div>
        {property.aiInsights.map((insight) => (
          <AIInsightCard key={insight.label} {...insight} variant="buy" />
        ))}
        <button className="btn btns" style={{ marginTop: 4 }} onClick={() => refetch()} disabled={isFetching}>
          <Icon name="ti-refresh" size={13} /> {isFetching ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <button className="btn btnp btnf" onClick={() => navigate(`/buy/visit/${propertyId}`)}>
        <Icon name="ti-clipboard-check" size={15} /> Start visit
      </button>
    </div>
  );
}
