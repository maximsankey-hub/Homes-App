import { AIInsightCard } from '../../components/common/AIInsightCard';
import { useUiStore } from '../../store/uiStore';
import { useProperties } from '../homes/useProperties';
import { useCompare } from './useCompare';

const DOT_COLORS = ['#1D9E75', '#534AB7'];

export function CompareScreen() {
  const { data: properties } = useProperties();
  const { compareSelection, setCompareSelection } = useUiStore();
  const [a, b] = compareSelection;
  const { data: compare, isLoading } = useCompare(a, b);

  const shortLabel = (address: string) => address.split(' ').slice(0, 2).join(' ');

  return (
    <div className="pad">
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <select
          value={a ?? ''}
          onChange={(e) => setCompareSelection([e.target.value || null, b])}
          style={{ flex: 1, padding: 8, borderRadius: 'var(--radius)', border: '0.5px solid var(--border-strong)' }}
        >
          <option value="">Select home A…</option>
          {properties?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.address}
            </option>
          ))}
        </select>
        <select
          value={b ?? ''}
          onChange={(e) => setCompareSelection([a, e.target.value || null])}
          style={{ flex: 1, padding: 8, borderRadius: 'var(--radius)', border: '0.5px solid var(--border-strong)' }}
        >
          <option value="">Select home B…</option>
          {properties?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.address}
            </option>
          ))}
        </select>
      </div>

      {!a || !b ? (
        <div className="card">
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Pick two tracked homes above to compare their lifestyle fit.</p>
        </div>
      ) : a === b ? (
        <div className="card">
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Choose two different homes.</p>
        </div>
      ) : isLoading || !compare ? (
        <div>Loading…</div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: DOT_COLORS[0] }} />
              {shortLabel(compare.propertyA.address)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: DOT_COLORS[1] }} />
              {shortLabel(compare.propertyB.address)}
            </div>
          </div>

          <div className="card">
            <div className="ct" style={{ marginBottom: 10 }}>
              Lifestyle dimensions
            </div>
            {compare.dimensions.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Visit both homes to compare factors.</div>
            ) : (
              compare.dimensions.map((d) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }} key={d.label}>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', width: 70, flexShrink: 0 }}>{d.label}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 4, borderRadius: 2, marginBottom: 3, background: DOT_COLORS[0], width: `${d.aValue * 10}%` }} />
                    <div style={{ height: 4, borderRadius: 2, background: DOT_COLORS[1], width: `${d.bValue * 10}%` }} />
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', width: 50, textAlign: 'right' }}>
                    {d.aValue.toFixed(1)}/{d.bValue.toFixed(1)}
                  </span>
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 500, color: DOT_COLORS[0] }}>{compare.propertyA.score?.toFixed(1) ?? '—'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{shortLabel(compare.propertyA.address)}</div>
            </div>
            <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 500, color: DOT_COLORS[1] }}>{compare.propertyB.score?.toFixed(1) ?? '—'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{shortLabel(compare.propertyB.address)}</div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div className="ct" style={{ margin: 0 }}>
                AI comparison
              </div>
              <span className="badge bb">Claude</span>
            </div>
            {compare.aiInsights.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Visit both homes to generate a comparison.</div>
            ) : (
              compare.aiInsights.map((insight) => <AIInsightCard key={insight.label} {...insight} variant="buy" />)
            )}
          </div>
        </>
      )}
    </div>
  );
}
