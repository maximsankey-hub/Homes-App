import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function ResetPasswordScreen() {
  const navigate = useNavigate();
  const updatePassword = useAuthStore((s) => s.updatePassword);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const canSubmit = password.length >= 6 && password === confirmPassword;

  const submit = async () => {
    if (!canSubmit) return;
    setError(null);
    setIsPending(true);
    try {
      await updatePassword(password);
      navigate('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update password. The reset link may have expired — request a new one.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="wrap">
      <div className="app">
        <div className="pad" style={{ paddingTop: 60 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 500 }}>Set a new password</div>
          </div>
          <input
            type="password"
            placeholder="New password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          {password.length > 0 && password.length < 6 && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -6, marginBottom: 8 }}>Password must be at least 6 characters.</p>
          )}
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <p style={{ fontSize: 12, color: 'var(--text-danger)', marginTop: -6, marginBottom: 8 }}>Passwords don't match.</p>
          )}
          {error && <p style={{ fontSize: 12, color: 'var(--text-danger)', marginBottom: 8 }}>{error}</p>}
          <button className="btn btnp btnf" disabled={!canSubmit || isPending} onClick={submit}>
            {isPending ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </div>
    </div>
  );
}
