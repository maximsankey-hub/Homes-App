import { Icon } from '../../components/common/Icon';
import { useListingBuyers } from './useListing';

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 7 ? '#1D9E75' : value >= 5 ? '#EF9F27' : '#E24B4A';
  const textColor = value >= 7 ? '#085041' : value >= 5 ? '#633806' : '#A32D2D';
  return (
    <div className="sent-r">
      <span className="sent-l">{label}</span>
      <div className="sent-t">
        <div className="sent-f" style={{ width: `${value * 10}%`, background: color }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 500, color: textColor, width: 26, textAlign: 'right' }}>{value.toFixed(1)}</span>
    </div>
  );
}

export function Buyers() {
  const { data, isLoading } = useListingBuyers();

  if (isLoading || !data) return <div className="pad">Loading…</div>;

  return (
    <div className="pad">
      <div className="card" style={{ background: '#E1F5EE', borderColor: '#9FE1CB' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#085041', marginBottom: 3 }}>
          <Icon name="ti-shield-check" size={13} /> Anonymized buyer data
        </div>
        <div style={{ fontSize: 11, color: '#0F6E56', lineHeight: 1.5 }}>
          Aggregated from buyers who evaluated this home and similar properties. No individual data is shared.
        </div>
      </div>

      <div className="slbl">This home — room scores</div>
      <div className="card" style={{ padding: '10px 12px' }}>
        {data.roomScores.map((r) => (
          <ScoreBar key={r.roomName} label={r.roomName} value={r.score} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 10, padding: 9, textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: '#1D9E75' }}>{data.emotionalAvg}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Emotional avg</div>
        </div>
        <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 10, padding: 9, textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-accent)' }}>{data.functionalAvg}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Functional avg</div>
        </div>
      </div>

      {data.themeChips.map((chip) => (
        <div className="chip" key={chip.text}>
          <Icon name={chip.icon} size={15} color={chip.color} />
          <span>{chip.text}</span>
        </div>
      ))}

      <div className="div" />
      <div className="slbl">What buyers in your area prioritize</div>
      <div className="card" style={{ padding: '10px 12px' }}>
        {data.buyerPriorities.map((p) => (
          <ScoreBar key={p.label} label={p.label} value={p.value} />
        ))}
      </div>

      <div className="div" />
      <div className="slbl">Lifestyle fit vs buyer profiles</div>
      <div className="card" style={{ padding: '10px 12px' }}>
        {data.lifestyleFit.map((f) => (
          <div className="fit-r" key={f.label}>
            <span className="fit-l">{f.label}</span>
            <div className="fit-t">
              <div className="fit-f" style={{ width: `${f.value * 10}%`, background: f.value >= 6 ? '#1D9E75' : '#E24B4A' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, color: f.value >= 6 ? '#085041' : '#A32D2D', width: 26, textAlign: 'right' }}>
              {f.value.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
      <div className="chip">
        <Icon name="ti-target" size={15} color="#1D9E75" />
        <span>{data.targetingChip}</span>
      </div>
    </div>
  );
}
