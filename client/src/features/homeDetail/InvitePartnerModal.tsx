import { useState } from 'react';
import { Icon } from '../../components/common/Icon';
import { useHousehold } from '../household/useHousehold';
import { useUiStore } from '../../store/uiStore';

export function InvitePartnerModal() {
  const closeModal = useUiStore((s) => s.closeModal);
  const { data: household, isLoading } = useHousehold();
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (!household) return;
    navigator.clipboard.writeText(household.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mover open" onClick={closeModal}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Invite a partner</h3>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
          Share this code — they'll enter it when they create their account, and they'll see the same homes and score
          rooms as themselves.
        </p>
        {isLoading || !household ? (
          <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--surface-1)',
              border: '0.5px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '10px 12px',
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 500, letterSpacing: 1 }}>{household.inviteCode}</span>
            <button className="btn btns" onClick={copy}>
              <Icon name={copied ? 'ti-check' : 'ti-tag'} size={13} /> {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
        <button className="btn btnp btnf" onClick={closeModal}>
          Done
        </button>
      </div>
    </div>
  );
}
