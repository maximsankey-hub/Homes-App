import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopBar } from './TopBar';
import { TabBar } from './TabBar';
import { Drawer } from './Drawer';
import { ModalHost } from '../modals/ModalHost';
import { useUiStore } from '../../store/uiStore';

export function AppShell() {
  const location = useLocation();
  const mode = useUiStore((s) => s.mode);
  const setMode = useUiStore((s) => s.setMode);

  useEffect(() => {
    if (location.pathname.startsWith('/sell') && mode !== 'sell') setMode('sell');
    else if (location.pathname.startsWith('/buy') && mode !== 'buy') setMode('buy');
  }, [location.pathname, mode, setMode]);

  return (
    <div className="wrap">
      <div className="app">
        <div className="chrome">
          <TopBar />
          <TabBar />
        </div>
        <div className="scroll">
          <Outlet />
        </div>
        <Drawer />
        <ModalHost />
      </div>
    </div>
  );
}
