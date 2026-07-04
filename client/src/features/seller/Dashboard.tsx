import { useNavigate } from 'react-router-dom';
import { AIInsightCard } from '../../components/common/AIInsightCard';
import { Icon } from '../../components/common/Icon';
import { ScoreRing } from '../../components/common/ScoreRing';
import { useListingDashboard } from './useListing';

export function Dashboard() {
  const { data: listing, isLoading } = useListingDashboard();
  const navigate = useNavigate();

  if (isLoading || !listing) return <div className="pad">Loading…</div>;

  return (
    <div className="pad">
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Estimated value range</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginTop: 3 }}>
              <span style={{ fontSize: 22, fontWeight: 500, color: '#1D9E75' }}>${(listing.estValueLow / 1000).toFixed(0)}K</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>–</span>
              <span style={{ fontSize: 22, fontWeight: 500, color: '#1D9E75' }}>${(listing.estValueHigh / 1000).toFixed(0)}K</span>
            </div>
          </div>
          <ScoreRing score={listing.confidenceScore} color="#1D9E75" size={50} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius)', padding: '9px 10px' }}>
          <div style={{ fontSize: 17, fontWeight: 500, color: '#1D9E75' }}>{listing.avgDaysOnMarket}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Avg days on market</div>
        </div>
        <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius)', padding: '9px 10px' }}>
          <div style={{ fontSize: 17, fontWeight: 500, color: 'var(--text-accent)' }}>${listing.pricePerSqft}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Price per sq ft</div>
        </div>
        <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius)', padding: '9px 10px' }}>
          <div style={{ fontSize: 17, fontWeight: 500, color: '#1D9E75' }}>{listing.buyerEmotionalAvg}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Buyer emotional score</div>
        </div>
        <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius)', padding: '9px 10px' }}>
          <div style={{ fontSize: 17, fontWeight: 500, color: 'var(--text-warning)' }}>{listing.buyerFunctionalAvg}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Buyer functional score</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
        <span className="badge bt">Market: {listing.marketStatus}</span>
        <span className="badge bp">{listing.buyerViewsCount} buyer views</span>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="ct" style={{ margin: 0 }}>
            AI insights
          </div>
          <span className="badge bt">
            <Icon name="ti-sparkles" size={10} /> Claude
          </span>
        </div>
        {listing.aiInsights.map((insight) => (
          <AIInsightCard key={insight.label} {...insight} variant="sell" />
        ))}
      </div>

      <button className="btn btnt btnf" onClick={() => navigate('/sell/improve')}>
        <Icon name="ti-hammer" size={15} /> View improvement plan
      </button>
    </div>
  );
}
