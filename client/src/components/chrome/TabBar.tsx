import { NavLink } from 'react-router-dom';
import { Icon } from '../common/Icon';
import { useUiStore } from '../../store/uiStore';
import { BUY_TABS, SELL_TABS } from './tabsConfig';

export function TabBar() {
  const mode = useUiStore((s) => s.mode);
  const tabs = mode === 'buy' ? BUY_TABS : SELL_TABS;
  const activeClass = mode === 'buy' ? 'ba' : 'sa';

  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) => `tab${isActive ? ` ${activeClass}` : ''}`}
        >
          <Icon name={tab.icon} size={19} />
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
