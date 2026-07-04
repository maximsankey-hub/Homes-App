import { useState } from 'react';
import { useUiStore } from '../../store/uiStore';
import { useCreateRenovation } from './useRenovations';

export function AddRenovationModal() {
  const closeModal = useUiStore((s) => s.closeModal);
  const modalContext = useUiStore((s) => s.modalContext) as { propertyId: string } | null;
  const createRenovation = useCreateRenovation(modalContext?.propertyId ?? '');
  const [title, setTitle] = useState('');
  const [room, setRoom] = useState('');

  if (!modalContext) return null;

  const submit = () => {
    if (!title.trim() || !room.trim()) return;
    createRenovation.mutate({ title: title.trim(), room: room.trim() }, { onSuccess: () => closeModal() });
  };

  return (
    <div className="mover open" onClick={closeModal}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Add renovation idea</h3>
        <input type="text" placeholder="e.g. Expand master closet" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="text" placeholder="Room, e.g. Kitchen" value={room} onChange={(e) => setRoom(e.target.value)} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={closeModal}>
            Cancel
          </button>
          <button
            className="btn btnp"
            style={{ flex: 1, justifyContent: 'center' }}
            disabled={!title.trim() || !room.trim() || createRenovation.isPending}
            onClick={submit}
          >
            {createRenovation.isPending ? 'Adding…' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
