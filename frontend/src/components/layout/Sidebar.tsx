import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Role } from '../../types';

// Minimal inline SVG icons — functional only, single muted color
const Icons = {
  dashboard: (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  ),
  customers: (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="5" r="2.5" />
      <path d="M1 14c0-2.76 2.24-5 5-5s5 2.24 5 5" />
      <path d="M11 7.5c1.38 0 2.5 1.12 2.5 2.5S14 13.5 11 14" strokeDasharray="2 1" />
    </svg>
  ),
  products: (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 5l6-3 6 3v6l-6 3-6-3V5z" />
      <path d="M8 2v12M2 5l6 3 6-3" />
    </svg>
  ),
  challans: (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="1" width="12" height="14" rx="1" />
      <path d="M5 5h6M5 8h6M5 11h4" />
    </svg>
  ),
  users: (
    <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="5" r="2.5" />
      <path d="M3 14c0-2.76 2.24-5 5-5s5 2.24 5 5" />
    </svg>
  ),
};

interface NavItem {
  to: string;
  label: string;
  icon: keyof typeof Icons;
  roles?: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',  label: 'Dashboard',       icon: 'dashboard' },
  { to: '/customers',  label: 'Customers',        icon: 'customers', roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
  { to: '/products',   label: 'Products',         icon: 'products' },
  { to: '/challans',   label: 'Sales Challans',   icon: 'challans',  roles: ['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE'] },
  { to: '/users',      label: 'Users',            icon: 'users',     roles: ['ADMIN'] },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();

  return (
    <>
      <div className={`sidebar-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-plate">NE</div>
          <div className="brand-text">
            Nexora ERP
            <small>Operations Portal</small>
          </div>
        </div>

        {NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role))).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {Icons[item.icon]}
            {item.label}
          </NavLink>
        ))}

        <div className="sidebar-footer">
          <span className="field-hint">v1.0 · Nexora ERP</span>
        </div>
      </aside>
    </>
  );
}
