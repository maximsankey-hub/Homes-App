import { useParams } from 'react-router-dom';
import { Icon } from '../../components/common/Icon';
import { useUiStore } from '../../store/uiStore';
import { usePartnerComparison } from './usePartnerComparison';

export function PartnerTab() {
  const { propertyId } = useParams();
  const { data, isLoading } = usePartnerComparison(propertyId);
  const openModal = useUiStore((s) => s.openModal);

  if (isLoading || !data) return <div>Loading…</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Partner scores</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Independent evaluations compared</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 10, padding: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 500, color: '#085041', marginBottom: 4 }}>You</div>
          <div style={{ fontSize: 24, fontWeight: 500, color: '#1D9E75' }}>{data.self.score}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Feeling: {data.self.feelingLabel}</div>
        </div>
        <div style={{ background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 10, padding: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 500, color: '#3C3489', marginBottom: 4 }}>Partner</div>
          <div style={{ fontSize: 24, fontWeight: 500, color: 'var(--text-accent)' }}>{data.partner?.score ?? '—'}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
            {data.partner ? `Feeling: ${data.partner.feelingLabel}` : 'Not invited yet'}
          </div>
        </div>
      </div>

      {data.partner ? (
        <>
          <div className="card">
            <div className="ct" style={{ marginBottom: 10 }}>
              Factor by factor
            </div>
            {data.factors.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No overlapping rooms scored by both of you yet.</div>
            ) : (
              data.factors.map((f) => (
                <div style={{ marginBottom: 9 }} key={f.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 3 }}>
                    <span>{f.label}</span>
                    <span style={{ color: f.agree ? '#1D9E75' : 'var(--text-warning)' }}>
                      {f.agree ? 'Agree' : `Gap: ${f.selfValue > f.partnerValue ? '+' : ''}${round1(f.selfValue - f.partnerValue)}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginBottom: 2 }}>
                    <div style={{ height: 4, borderRadius: 2, background: '#1D9E75', width: `${f.selfValue * 10}%` }} />
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 3 }}>{f.selfValue}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <div style={{ height: 4, borderRadius: 2, background: '#534AB7', width: `${f.partnerValue * 10}%` }} />
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 3 }}>{f.partnerValue}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="card">
            <div className="ct">Agreement</div>
            {data.agreement.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Score the same rooms to see agreement data.</div>
            ) : (
              data.agreement.map((a) => (
                <div
                  key={a.label}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '0.5px solid var(--border)' }}
                >
                  <span style={{ fontSize: 12 }}>{a.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.note}</span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 7px',
                        borderRadius: 99,
                        fontSize: 10,
                        fontWeight: 500,
                        background: a.agree ? 'var(--bg-success)' : 'var(--bg-danger)',
                        color: a.agree ? 'var(--text-success)' : 'var(--text-danger)',
                      }}
                    >
                      {a.agree ? 'Agree' : 'Disagree'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          {data.partner.note && (
            <div className="card">
              <div className="ct">Partner's notes</div>
              <div className="chip">
                <Icon name="ti-message" size={15} color="#534AB7" />
                <span>{data.partner.note}</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <button className="btn btnf btns" onClick={() => openModal('invitePartner', { propertyId })}>
          <Icon name="ti-user-plus" size={14} /> Invite a partner
        </button>
      )}
    </div>
  );
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}
