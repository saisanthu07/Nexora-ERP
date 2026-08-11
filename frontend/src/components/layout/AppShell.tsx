import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div>
        <Topbar onToggleMobileNav={() => setMobileNavOpen(!mobileNavOpen)} />
        <main className="desk">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
