import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Mode = 'buy' | 'sell';
export type ModalId =
  | 'addProperty'
  | 'editProperty'
  | 'invitePartner'
  | 'addRenovation'
  | 'addImprovement'
  | 'tagMedia'
  | 'viewMedia'
  | null;

interface UiState {
  mode: Mode;
  drawerOpen: boolean;
  activeModal: ModalId;
  modalContext: Record<string, unknown> | null;
  compareSelection: [string | null, string | null];
  nearbySearch: string;
  nearbyCategory: string;
  setMode: (mode: Mode) => void;
  toggleDrawer: (open?: boolean) => void;
  openModal: (id: ModalId, context?: Record<string, unknown>) => void;
  closeModal: () => void;
  setCompareSelection: (selection: [string | null, string | null]) => void;
  setNearbySearch: (value: string) => void;
  setNearbyCategory: (value: string) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      mode: 'buy',
      drawerOpen: false,
      activeModal: null,
      modalContext: null,
      compareSelection: [null, null],
      nearbySearch: '',
      nearbyCategory: 'all',
      setMode: (mode) => set({ mode, drawerOpen: false }),
      toggleDrawer: (open) => set((s) => ({ drawerOpen: open ?? !s.drawerOpen })),
      openModal: (id, context) => set({ activeModal: id, modalContext: context ?? null }),
      closeModal: () => set({ activeModal: null, modalContext: null }),
      setCompareSelection: (selection) => set({ compareSelection: selection }),
      setNearbySearch: (value) => set({ nearbySearch: value }),
      setNearbyCategory: (value) => set({ nearbyCategory: value }),
    }),
    {
      name: 'homes-ui-store',
      partialize: (s) => ({ mode: s.mode }),
    },
  ),
);
