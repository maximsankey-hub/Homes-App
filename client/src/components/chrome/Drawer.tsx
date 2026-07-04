import { useNavigate } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { useUiStore } from '../../store/uiStore';

export function Drawer() {
  const { mode, drawerOpen, setMode, toggleDrawer, openModal } = useUiStore();
  const navigate = useNavigate();

  const switchMode = (next: 'buy' | 'sell') => {
    setMode(next);
    navigate(next === 'buy' ? '/buy/homes' : '/sell/dashboard');
  };

  const addProperty = () => {
    toggleDrawer(false);
    openModal('addProperty');
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
        <div className="ds">Account</div>
        <div className="dlink">
          <Icon name="ti-user" size={17} /> Profile settings
        </div>
        <div className="dlink">
          <Icon name="ti-info-circle" size={17} /> Help and support
        </div>
      </div>
    </>
  );
}
