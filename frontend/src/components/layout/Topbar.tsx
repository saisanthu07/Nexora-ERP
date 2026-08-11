import { useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../ui/Button';
import { useTheme } from '../../hooks/useTheme';

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/customers': 'Customers',
  '/products':  'Products',
  '/challans':  'Sales Challans',
  '/users':     'Users',
};

interface TopbarProps {
  onToggleMobileNav: () => void;
}

// Sun icon (light mode indicator)
function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

// Moon icon (dark mode indicator)
function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function Topbar({ onToggleMobileNav }: TopbarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { theme, toggle } = useTheme();

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
        <button
          className="theme-toggle"
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>

        <span className="role-tag">{user?.role}</span>
        <span className="user-name-label">{user?.name}</span>
        <Button variant="ghost" size="sm" onClick={logout}>
          Log out
        </Button>
      </div>
    </header>
  );
}
