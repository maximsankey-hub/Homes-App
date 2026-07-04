import { useState } from 'react';
import { useUiStore } from '../../store/uiStore';
import { useInvitePartner } from './usePartnerComparison';

export function InvitePartnerModal() {
  const closeModal = useUiStore((s) => s.closeModal);
  const invitePartner = useInvitePartner();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');

  const submit = () => {
    if (!name.trim()) return;
    invitePartner.mutate({ name: name.trim(), contact: contact.trim() || undefined }, { onSuccess: () => closeModal() });
  };

  return (
    <div className="mover open" onClick={closeModal}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Invite a partner</h3>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
          They'll score homes independently. You'll see where you agree and disagree.
        </p>
        <input type="text" placeholder="Partner's name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="text" placeholder="Email or phone (optional)" value={contact} onChange={(e) => setContact(e.target.value)} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={closeModal}>
            Cancel
          </button>
          <button
            className="btn btnp"
            style={{ flex: 1, justifyContent: 'center' }}
            disabled={!name.trim() || invitePartner.isPending}
            onClick={submit}
          >
            {invitePartner.isPending ? 'Sending…' : 'Send invite'}
          </button>
        </div>
      </div>
    </div>
  );
}
