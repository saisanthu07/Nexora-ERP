import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div>
        <Topbar />
        <main className="desk">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
