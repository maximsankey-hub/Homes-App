import { useReducer } from 'react';

export type FactorKey = 'layout' | 'storage' | 'light' | 'vibe';

interface VisitFlowState {
  step: 0 | 1 | 2 | 3;
  roomName: string;
  roomIcon: string;
  layout: number;
  storage: number;
  light: number;
  vibe: number;
  feeling: string;
  note: string;
  pendingRoomFiles: { file: File; kind: 'PHOTO' | 'VIDEO' | 'VOICE' }[];
  lastSaved: { roomName: string; emotionalAvg: number; functionalAvg: number; feeling: string } | null;
}

type Action =
  | { type: 'SELECT_ROOM'; name: string; icon: string }
  | { type: 'GOTO_STEP'; step: 0 | 1 | 2 | 3 }
  | { type: 'SET_FACTOR'; key: FactorKey; value: number }
  | { type: 'SET_FEELING'; feeling: string }
  | { type: 'SET_NOTE'; note: string }
  | { type: 'ADD_PENDING_FILE'; file: File; kind: 'PHOTO' | 'VIDEO' | 'VOICE' }
  | { type: 'ROOM_SAVED'; summary: VisitFlowState['lastSaved'] }
  | { type: 'RESET_FOR_NEW_ROOM' };

const initialState: VisitFlowState = {
  step: 0,
  roomName: 'Kitchen',
  roomIcon: 'ti-tools-kitchen-2',
  layout: 7,
  storage: 5,
  light: 8,
  vibe: 9,
  feeling: 'Calm',
  note: '',
  pendingRoomFiles: [],
  lastSaved: null,
};

function reducer(state: VisitFlowState, action: Action): VisitFlowState {
  switch (action.type) {
    case 'SELECT_ROOM':
      return { ...state, roomName: action.name, roomIcon: action.icon };
    case 'GOTO_STEP':
      return { ...state, step: action.step };
    case 'SET_FACTOR':
      return { ...state, [action.key]: action.value };
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
    default:
      return state;
  }
}

export function emotionalAvg(s: { light: number; vibe: number }) {
  return (s.light + s.vibe) / 2;
}
export function functionalAvg(s: { layout: number; storage: number }) {
  return (s.layout + s.storage) / 2;
}

export function useVisitFlow() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return { state, dispatch };
}
