import { useReducer } from 'react';

export type FactorKey = 'layout' | 'storage' | 'light' | 'vibe';

export interface NeighborhoodDraft {
  curbAppeal: number;
  streetVibe: number;
  feeling: string;
  note: string;
}

interface VisitFlowState {
  step: 0 | 1 | 2 | 3 | 4;
  roomName: string;
  roomIcon: string;
  layout: number;
  storage: number;
  light: number;
  vibe: number;
  feeling: string;
  note: string;
  customValues: Record<string, number>;
  pendingRoomFiles: { file: File; kind: 'PHOTO' | 'VIDEO' | 'VOICE' }[];
  lastSaved: { roomName: string; emotionalAvg: number; functionalAvg: number; feeling: string } | null;
  neighborhood: NeighborhoodDraft;
}

export interface ExistingRoomScore {
  layout: number;
  storage: number;
  light: number;
  vibe: number;
  feeling: string;
  note: string;
  customValues?: Record<string, number>;
}

export interface CustomMetricLike {
  id: string;
  category: 'EMOTIONAL' | 'FUNCTIONAL';
}

const NEUTRAL_SCORE: ExistingRoomScore = { layout: 5, storage: 5, light: 5, vibe: 5, feeling: 'Calm', note: '', customValues: {} };
const NEUTRAL_NEIGHBORHOOD: NeighborhoodDraft = { curbAppeal: 5, streetVibe: 5, feeling: 'Calm', note: '' };

type Action =
  | { type: 'SELECT_ROOM'; name: string; icon: string; existingScore?: ExistingRoomScore | null }
  | { type: 'GOTO_STEP'; step: 0 | 1 | 2 | 3 | 4 }
  | { type: 'SET_FACTOR'; key: FactorKey; value: number }
  | { type: 'SET_CUSTOM_FACTOR'; metricId: string; value: number }
  | { type: 'SET_FEELING'; feeling: string }
  | { type: 'SET_NOTE'; note: string }
  | { type: 'ADD_PENDING_FILE'; file: File; kind: 'PHOTO' | 'VIDEO' | 'VOICE' }
  | { type: 'ROOM_SAVED'; summary: VisitFlowState['lastSaved'] }
  | { type: 'RESET_FOR_NEW_ROOM' }
  | { type: 'PREFILL_NEIGHBORHOOD'; data: NeighborhoodDraft | null }
  | { type: 'SET_NEIGHBORHOOD_FACTOR'; key: 'curbAppeal' | 'streetVibe'; value: number }
  | { type: 'SET_NEIGHBORHOOD_FEELING'; feeling: string }
  | { type: 'SET_NEIGHBORHOOD_NOTE'; note: string };

const initialState: VisitFlowState = {
  step: 0,
  roomName: 'Kitchen',
  roomIcon: 'ti-tools-kitchen-2',
  ...NEUTRAL_SCORE,
  pendingRoomFiles: [],
  lastSaved: null,
  neighborhood: NEUTRAL_NEIGHBORHOOD,
};

function reducer(state: VisitFlowState, action: Action): VisitFlowState {
  switch (action.type) {
    case 'SELECT_ROOM':
      return { ...state, roomName: action.name, roomIcon: action.icon, ...(action.existingScore ?? NEUTRAL_SCORE) };
    case 'GOTO_STEP':
      return { ...state, step: action.step };
    case 'SET_FACTOR':
      return { ...state, [action.key]: action.value };
    case 'SET_CUSTOM_FACTOR':
      return { ...state, customValues: { ...state.customValues, [action.metricId]: action.value } };
    case 'SET_FEELING':
      return { ...state, feeling: action.feeling };
    case 'SET_NOTE':
      return { ...state, note: action.note };
    case 'ADD_PENDING_FILE':
      return { ...state, pendingRoomFiles: [...state.pendingRoomFiles, { file: action.file, kind: action.kind }] };
    case 'ROOM_SAVED':
      return { ...state, lastSaved: action.summary, step: 3 };
    case 'RESET_FOR_NEW_ROOM':
      return { ...initialState, step: 0 };
    case 'PREFILL_NEIGHBORHOOD':
      return { ...state, neighborhood: action.data ?? NEUTRAL_NEIGHBORHOOD };
    case 'SET_NEIGHBORHOOD_FACTOR':
      return { ...state, neighborhood: { ...state.neighborhood, [action.key]: action.value } };
    case 'SET_NEIGHBORHOOD_FEELING':
      return { ...state, neighborhood: { ...state.neighborhood, feeling: action.feeling } };
    case 'SET_NEIGHBORHOOD_NOTE':
      return { ...state, neighborhood: { ...state.neighborhood, note: action.note } };
    default:
      return state;
  }
}

export function emotionalAvg(s: { light: number; vibe: number; customValues?: Record<string, number> }, customMetrics: CustomMetricLike[] = []) {
  const values = [s.light, s.vibe, ...customMetrics.filter((m) => m.category === 'EMOTIONAL').map((m) => s.customValues?.[m.id] ?? 5)];
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
export function functionalAvg(s: { layout: number; storage: number; customValues?: Record<string, number> }, customMetrics: CustomMetricLike[] = []) {
  const values = [s.layout, s.storage, ...customMetrics.filter((m) => m.category === 'FUNCTIONAL').map((m) => s.customValues?.[m.id] ?? 5)];
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function useVisitFlow() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return { state, dispatch };
}
