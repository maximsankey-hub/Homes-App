import { Icon } from '../common/Icon';
import { useUiStore } from '../../store/uiStore';

export function TopBar() {
  const mode = useUiStore((s) => s.mode);
  const toggleDrawer = useUiStore((s) => s.toggleDrawer);
  const isBuy = mode === 'buy';

  return (
    <div className="topbar">
      <div className="wordmark">
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            background: isBuy ? 'var(--fill-accent)' : '#1D9E75',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name={isBuy ? 'ti-home-search' : 'ti-home-dollar'} size={14} color="#fff" />
        </div>
        <span>Homes</span>
        <span className={`mode-pip ${isBuy ? 'pip-buy' : 'pip-sell'}`}>{isBuy ? 'Buying' : 'Selling'}</span>
      </div>
      <button className="menu-btn" onClick={() => toggleDrawer(true)} aria-label="Open menu">
        <Icon name="ti-menu-2" size={18} />
      </button>
    </div>
  );
}
