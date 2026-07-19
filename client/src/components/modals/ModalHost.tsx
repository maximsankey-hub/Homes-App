import { useUiStore } from '../../store/uiStore';
import { AddPropertyModal } from '../../features/homes/AddPropertyModal';
import { TagMediaModal } from '../../features/homeDetail/TagMediaModal';
import { InvitePartnerModal } from '../../features/homeDetail/InvitePartnerModal';
import { AddRenovationModal } from '../../features/homeDetail/AddRenovationModal';
import { AddImprovementModal } from '../../features/seller/AddImprovementModal';
import { MediaLightboxModal } from '../../features/homeDetail/MediaLightboxModal';
import { StyleSwipeModal } from '../../features/profile/StyleSwipeModal';

export function ModalHost() {
  const activeModal = useUiStore((s) => s.activeModal);

  if (!activeModal) return null;

  if (activeModal === 'addProperty' || activeModal === 'editProperty') {
    return <AddPropertyModal />;
  }
  if (activeModal === 'tagMedia') {
    return <TagMediaModal />;
  }
  if (activeModal === 'viewMedia') {
    return <MediaLightboxModal />;
  }
  if (activeModal === 'invitePartner') {
    return <InvitePartnerModal />;
  }
  if (activeModal === 'addRenovation') {
    return <AddRenovationModal />;
  }
  if (activeModal === 'addImprovement') {
    return <AddImprovementModal />;
  }
  if (activeModal === 'styleSwipe') {
    return <StyleSwipeModal />;
  }

  return null;
}
