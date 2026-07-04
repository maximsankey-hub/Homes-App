import { useState } from 'react';
import { useUiStore } from '../../store/uiStore';
import { useCreateImprovement } from './useListing';

export function AddImprovementModal() {
  const closeModal = useUiStore((s) => s.closeModal);
  const createImprovement = useCreateImprovement();
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('');

  const submit = () => {
    if (!title.trim()) return;
    createImprovement.mutate({ title: area.trim() ? `${title.trim()} (${area.trim()})` : title.trim() }, { onSuccess: () => closeModal() });
  };

  return (
    <div className="mover open" onClick={closeModal}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Add improvement idea</h3>
        <input
          type="text"
          placeholder="e.g. Refinish hardwood floors, add mudroom..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input type="text" placeholder="Room or area, e.g. Entryway" value={area} onChange={(e) => setArea(e.target.value)} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={closeModal}>
            Cancel
          </button>
          <button
            className="btn btnt"
            style={{ flex: 1, justifyContent: 'center' }}
            disabled={!title.trim() || createImprovement.isPending}
            onClick={submit}
          >
            {createImprovement.isPending ? 'Adding…' : 'Add idea'}
          </button>
        </div>
      </div>
    </div>
  );
}
