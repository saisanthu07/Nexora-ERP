import { useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../ui/Button';

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/customers': 'Customer Ledger',
  '/products': 'Inventory Register',
  '/challans': 'Sales Challans',
};

interface TopbarProps {
  onToggleMobileNav: () => void;
}

export function Topbar({ onToggleMobileNav }: TopbarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const title =
    Object.entries(TITLES).find(([path]) => location.pathname.startsWith(path))?.[1] || 'Nexora ERP';

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="icon-btn mobile-toggle" onClick={onToggleMobileNav} aria-label="Toggle navigation">
          ☰
        </button>
        <span className="topbar-title">{title}</span>
      </div>
      <div className="topbar-user">
        <span className="role-tag">{user?.role}</span>
        <span className="user-name-label">{user?.name}</span>
        <Button variant="ghost" size="sm" onClick={logout}>
          Log out
        </Button>
      </div>
    </header>
  );
}
