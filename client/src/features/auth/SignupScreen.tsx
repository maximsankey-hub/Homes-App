import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/apiClient';
import { useAuthStore } from '../../store/authStore';

export function SignupScreen() {
  const navigate = useNavigate();
  const signUp = useAuthStore((s) => s.signUp);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length >= 6 && password === confirmPassword;

  const submit = async () => {
    if (!canSubmit) return;
    setError(null);
    setIsPending(true);
    try {
      const { needsEmailConfirmation } = await signUp(email.trim(), password);
      if (needsEmailConfirmation) {
        // No session yet, so /household/join can't run until they confirm and log in —
        // stash the invite code so the post-confirmation login can still use it.
        if (inviteCode.trim()) localStorage.setItem('pendingInviteCode', inviteCode.trim());
        setNeedsConfirmation(true);
        return;
      }
      await api.post('/household/join', inviteCode.trim() ? { inviteCode: inviteCode.trim() } : {});
      navigate('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign up.');
    } finally {
      setIsPending(false);
    }
  };

  if (needsConfirmation) {
    return (
      <div className="wrap">
        <div className="app">
          <div className="pad" style={{ paddingTop: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>Check your email</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              We sent a confirmation link to {email}. Click it, then come back and log in.
            </p>
            <button className="btn btnp btnf" style={{ marginTop: 16 }} onClick={() => navigate('/login')}>
              Go to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="app">
        <div className="pad" style={{ paddingTop: 60 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 500 }}>Create your account</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Have an invite code from your partner? Enter it below.
            </div>
          </div>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <input
            type="text"
            placeholder="Invite code (optional)"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
          {password.length > 0 && password.length < 6 && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -6, marginBottom: 8 }}>Password must be at least 6 characters.</p>
          )}
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <p style={{ fontSize: 12, color: 'var(--text-danger)', marginTop: -6, marginBottom: 8 }}>Passwords don't match.</p>
          )}
          {error && <p style={{ fontSize: 12, color: 'var(--text-danger)', marginBottom: 8 }}>{error}</p>}
          <button className="btn btnp btnf" disabled={!canSubmit || isPending} onClick={submit}>
            {isPending ? 'Creating account…' : 'Create account'}
          </button>
          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
              Log in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
