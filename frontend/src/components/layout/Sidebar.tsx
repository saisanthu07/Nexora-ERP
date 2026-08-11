import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Role } from '../../types';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  roles?: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: '◆' },
  { to: '/customers', label: 'Customers', icon: '☰', roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
  { to: '/products', label: 'Products', icon: '▣' },
  { to: '/challans', label: 'Challans', icon: '§', roles: ['ADMIN', 'SALES', 'ACCOUNTS', 'WAREHOUSE'] },
];

export function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-plate">NE</div>
        <div className="brand-text">
          Nexora ERP
          <small>Ops Portal</small>
        </div>
      </div>

      {NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role))).map((item) => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}

      <div className="sidebar-footer">
        <span className="field-hint">v1.0 · Nexora ERP</span>
      </div>
    </aside>
  );
}
