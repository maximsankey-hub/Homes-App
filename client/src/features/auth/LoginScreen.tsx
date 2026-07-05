import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/apiClient';
import { useAuthStore } from '../../store/authStore';

export function LoginScreen() {
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.signIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const submit = async () => {
    if (!canSubmit) return;
    setError(null);
    setIsPending(true);
    try {
      await signIn(email.trim(), password);
      // Idempotent — resolves an existing membership, or recovers one after a
      // full demo reset (see seed.ts) without needing an invite code again.
      // If signup left a pending invite code (email confirmation was required,
      // so it couldn't be used until now), consume it on this first login.
      const pendingInviteCode = localStorage.getItem('pendingInviteCode');
      await api.post('/household/join', pendingInviteCode ? { inviteCode: pendingInviteCode } : {});
      if (pendingInviteCode) localStorage.removeItem('pendingInviteCode');
      navigate('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not log in.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="wrap">
      <div className="app">
        <div className="pad" style={{ paddingTop: 60 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 500 }}>Welcome back</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Log in to your household</div>
          </div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          {error && <p style={{ fontSize: 12, color: 'var(--text-danger)', marginBottom: 8 }}>{error}</p>}
          <button className="btn btnp btnf" disabled={!canSubmit || isPending} onClick={submit}>
            {isPending ? 'Logging in…' : 'Log in'}
          </button>
          <div style={{ textAlign: 'center', marginTop: 10, fontSize: 13 }}>
            <a href="/forgot-password" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}>
              Forgot password?
            </a>
          </div>
          <div style={{ textAlign: 'center', marginTop: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
            New here?{' '}
            <a href="/signup" onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>
              Create an account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
