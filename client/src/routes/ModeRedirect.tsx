import { Navigate } from 'react-router-dom';
import { useUiStore } from '../store/uiStore';

export function ModeRedirect() {
  const mode = useUiStore((s) => s.mode);
  return <Navigate to={mode === 'buy' ? '/buy/homes' : '/sell/dashboard'} replace />;
}
