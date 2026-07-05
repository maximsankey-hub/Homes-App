import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon } from '../../components/common/Icon';
import { api } from '../../lib/apiClient';
import { queryKeys } from '../../lib/queryKeys';
import { useUiStore } from '../../store/uiStore';

interface RoomOption {
  id: string;
  name: string;
  icon: string;
}

export function TagMediaModal() {
  const closeModal = useUiStore((s) => s.closeModal);
  const modalContext = useUiStore((s) => s.modalContext) as { mediaId: string; propertyId: string; rooms: RoomOption[] } | null;
  const queryClient = useQueryClient();

  const tagMedia = useMutation({
    mutationFn: (roomId: string) => api.patch(`/media/${modalContext?.mediaId}`, { roomId }),
    onSuccess: () => {
      if (modalContext) queryClient.invalidateQueries({ queryKey: queryKeys.property(modalContext.propertyId) });
      closeModal();
    },
  });

  const deleteMedia = useMutation({
    mutationFn: () => api.delete(`/media/${modalContext?.mediaId}`),
    onSuccess: () => {
      if (modalContext) queryClient.invalidateQueries({ queryKey: queryKeys.property(modalContext.propertyId) });
      closeModal();
    },
  });

  if (!modalContext) return null;

  return (
    <div className="mover c open" onClick={closeModal}>
      <div className="modal r" onClick={(e) => e.stopPropagation()}>
        <h3>Tag this media to a room</h3>
        <div className="rgrid" style={{ margin: '0 0 12px' }}>
          {modalContext.rooms.map((room) => (
            <div key={room.id} className="rc" onClick={() => tagMedia.mutate(room.id)}>
              <Icon name={room.icon} size={20} />
              <span>{room.name}</span>
            </div>
          ))}
        </div>
        <button className="btn btnf" onClick={closeModal}>
          Keep untagged for now
        </button>
        <button
          className="btn btnf"
          style={{ color: 'var(--text-danger)', marginTop: 6 }}
          onClick={() => {
            if (window.confirm('Delete this media?')) deleteMedia.mutate();
          }}
        >
          Delete this media
        </button>
      </div>
    </div>
  );
}
