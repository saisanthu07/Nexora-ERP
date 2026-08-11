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
          <small>Ops Portal</small>
        </div>
      </div>

      {NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role))).map((item) => (
        <NavLink key={item.to} to={item.to} onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">{item.icon}</span>
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
