import { useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../ui/Button';

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/customers': 'Customer Ledger',
  '/products': 'Inventory Register',
  '/challans': 'Sales Challans',
};

export function Topbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const title =
    Object.entries(TITLES).find(([path]) => location.pathname.startsWith(path))?.[1] || 'Ledgerworks';

  return (
    <header className="topbar">
      <span className="topbar-title">{title}</span>
      <div className="topbar-user">
        <span className="role-tag">{user?.role}</span>
        <span style={{ color: '#f2ead6', fontSize: 13, fontWeight: 600 }}>{user?.name}</span>
        <Button variant="ghost" size="sm" onClick={logout}>
          Log out
        </Button>
      </div>
    </header>
  );
}
