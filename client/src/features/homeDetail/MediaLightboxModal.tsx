import { useState } from 'react';
import { Icon } from '../../components/common/Icon';
import { useUiStore } from '../../store/uiStore';
import { useDeleteMedia } from './useMedia';
import type { Media } from 'shared';

interface LightboxContext {
  media: Media[];
  index: number;
}

export function MediaLightboxModal() {
  const closeModal = useUiStore((s) => s.closeModal);
  const modalContext = useUiStore((s) => s.modalContext) as unknown as LightboxContext | null;
  const [index, setIndex] = useState(modalContext?.index ?? 0);
  const deleteMedia = useDeleteMedia(modalContext?.media[0]?.propertyId ?? '');

  if (!modalContext || modalContext.media.length === 0) return null;

  const items = modalContext.media;
  const current = items[index];
  const go = (delta: number) => setIndex((i) => (i + delta + items.length) % items.length);

  const handleDelete = () => {
    if (!window.confirm('Delete this media?')) return;
    deleteMedia.mutate(current.id, { onSuccess: closeModal });
  };

  return (
    <div className="lightbox" onClick={closeModal}>
      <button
        className="lbx-close"
        style={{ right: 60 }}
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
        aria-label="Delete"
      >
        <Icon name="ti-trash" size={18} color="#fff" />
      </button>
      <button className="lbx-close" onClick={closeModal} aria-label="Close">
        <Icon name="ti-x" size={22} color="#fff" />
      </button>

      {items.length > 1 && (
        <button
          className="lbx-nav lbx-prev"
          onClick={(e) => {
            e.stopPropagation();
            go(-1);
          }}
          aria-label="Previous"
        >
          <Icon name="ti-chevron-left" size={26} color="#fff" />
        </button>
      )}

      <div className="lbx-content" onClick={(e) => e.stopPropagation()}>
        {current.type === 'PHOTO' ? (
          <img src={current.filePath} alt="" />
        ) : current.type === 'VIDEO' ? (
          <video src={current.filePath} controls autoPlay />
        ) : (
          <audio src={current.filePath} controls autoPlay />
        )}
      </div>

      {items.length > 1 && (
        <button
          className="lbx-nav lbx-next"
          onClick={(e) => {
            e.stopPropagation();
            go(1);
          }}
          aria-label="Next"
        >
          <Icon name="ti-chevron-right" size={26} color="#fff" />
        </button>
      )}

      {items.length > 1 && (
        <div className="lbx-count">
          {index + 1} / {items.length}
        </div>
      )}
    </div>
  );
}
