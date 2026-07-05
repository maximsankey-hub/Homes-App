import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useHousehold } from '../../features/household/useHousehold';

export function Drawer() {
  const { mode, drawerOpen, setMode, toggleDrawer, openModal } = useUiStore();
  const navigate = useNavigate();
  const signOut = useAuthStore((s) => s.signOut);
  const { data: household } = useHousehold();
  const [copied, setCopied] = useState(false);

  const switchMode = (next: 'buy' | 'sell') => {
    setMode(next);
    navigate(next === 'buy' ? '/buy/homes' : '/sell/dashboard');
  };

  const addProperty = () => {
    toggleDrawer(false);
    openModal('addProperty');
  };

  const copyInviteCode = () => {
    if (!household) return;
    navigator.clipboard.writeText(household.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const logOut = async () => {
    toggleDrawer(false);
    await signOut();
    navigate('/login');
  };

  return (
    <>
      <div
        className={`drawer-ov${drawerOpen ? ' open' : ''}`}
        onClick={() => toggleDrawer(false)}
      />
      <div className={`drawer${drawerOpen ? ' open' : ''}`}>
        <button className="dclose" onClick={() => toggleDrawer(false)} aria-label="Close menu">
          <Icon name="ti-x" size={14} />
        </button>
        <div className="ds">Mode</div>
        <div className="dmode">
          <button className={`dmb${mode === 'buy' ? ' dmbuy' : ''}`} onClick={() => switchMode('buy')}>
            <Icon name="ti-home-search" size={12} /> Buying
          </button>
          <button className={`dmb${mode === 'sell' ? ' dmsell' : ''}`} onClick={() => switchMode('sell')}>
            <Icon name="ti-home-dollar" size={12} /> Selling
          </button>
        </div>
        {mode === 'buy' ? (
          <div>
            <div className="ds">Your search</div>
            <div className="dlink">
              <Icon name="ti-home" size={17} /> Tracked properties
            </div>
            <div className="dlink" onClick={addProperty}>
              <Icon name="ti-plus" size={17} /> Add a property
            </div>
          </div>
        ) : (
          <div>
            <div className="ds">Your home</div>
            <div className="dlink">
              <Icon name="ti-home" size={17} /> Your listing
            </div>
          </div>
        )}
        <div className="div" style={{ margin: '6px 0' }} />
        <div className="ds">Household</div>
        {household && (
          <div style={{ padding: '0 4px 8px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
              {household.members.map((m) => (
                <span key={m.id} className="badge bb" style={{ borderColor: m.colorHex }}>
                  {m.name}
                  {m.isYou ? ' (you)' : ''}
                </span>
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--surface-1)',
                border: '0.5px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '7px 10px',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: 1 }}>{household.inviteCode}</span>
              <button className="btn btns" onClick={copyInviteCode}>
                <Icon name={copied ? 'ti-check' : 'ti-tag'} size={12} /> {copied ? 'Copied' : 'Copy invite code'}
              </button>
            </div>
          </div>
        )}
        <div className="div" style={{ margin: '6px 0' }} />
        <div className="ds">Account</div>
        <div className="dlink">
          <Icon name="ti-user" size={17} /> Profile settings
        </div>
        <div className="dlink">
          <Icon name="ti-info-circle" size={17} /> Help and support
        </div>
        <div className="dlink" onClick={logOut}>
          <Icon name="ti-logout" size={17} /> Log out
        </div>
      </div>
    </>
  );
}
