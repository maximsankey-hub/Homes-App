import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const resetPassword = useAuthStore((s) => s.resetPassword);

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [sent, setSent] = useState(false);

  const canSubmit = email.trim().length > 0;

  const submit = async () => {
    if (!canSubmit) return;
    setError(null);
    setIsPending(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send reset email.');
    } finally {
      setIsPending(false);
    }
  };

  if (sent) {
    return (
      <div className="wrap">
        <div className="app">
          <div className="pad" style={{ paddingTop: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>Check your email</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              If an account exists for {email}, we sent a link to reset your password.
            </p>
            <button className="btn btnp btnf" style={{ marginTop: 16 }} onClick={() => navigate('/login')}>
              Back to login
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
            <div style={{ fontSize: 20, fontWeight: 500 }}>Reset your password</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              We'll email you a link to set a new one.
            </div>
          </div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          {error && <p style={{ fontSize: 12, color: 'var(--text-danger)', marginBottom: 8 }}>{error}</p>}
          <button className="btn btnp btnf" disabled={!canSubmit || isPending} onClick={submit}>
            {isPending ? 'Sending…' : 'Send reset link'}
          </button>
          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: 'var(--text-secondary)' }}>
            <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
              Back to login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
