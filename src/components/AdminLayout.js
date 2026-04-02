import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/users', label: 'Users' },
  { to: '/orders', label: 'Orders' },
  { to: '/vendors', label: 'Vendors' },
  { to: '/categories', label: 'Categories' },
  { to: '/rewards', label: 'Rewards' },
  { to: '/referrals', label: 'Referrals' },
];

const COLORS = {
  primary: '#cc0001',
  background: '#fafafa',
  surface: '#ffffff',
  textPrimary: '#1d1b20',
  textSecondary: '#6c6c6c',
  divider: '#e0e0e0',
  soft: '#fff5f5',
};

const AdminLayout = ({ title, subtitle, children, headerActions }) => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <button type="button" style={styles.brand} onClick={() => navigate('/dashboard')}>
          <div style={styles.logoIcon}>EC</div>
          <div>
            <div style={styles.logoText}>Admin</div>
            <div style={styles.logoSubtext}>Control Center</div>
          </div>
        </button>

        <nav style={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => (isActive ? { ...styles.navItem, ...styles.navItemActive } : styles.navItem)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button type="button" style={styles.logoutBtn} onClick={logout}>Logout</button>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>{title}</h1>
            {subtitle ? <p style={styles.subtitle}>{subtitle}</p> : null}
          </div>
          {headerActions ? <div>{headerActions}</div> : null}
        </header>
        {children}
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: COLORS.background,
  },
  sidebar: {
    width: '240px',
    background: COLORS.surface,
    borderRight: `1px solid ${COLORS.divider}`,
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    top: 0,
    left: 0,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px',
    border: 'none',
    borderBottom: `1px solid ${COLORS.divider}`,
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: COLORS.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '700',
    flexShrink: 0,
  },
  logoText: {
    color: COLORS.textPrimary,
    fontSize: '18px',
    fontWeight: '700',
  },
  logoSubtext: {
    color: COLORS.textSecondary,
    fontSize: '12px',
    marginTop: '2px',
  },
  nav: {
    flex: 1,
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  navItem: {
    display: 'block',
    padding: '12px 14px',
    borderRadius: '10px',
    color: COLORS.textSecondary,
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
  },
  navItemActive: {
    background: COLORS.soft,
    color: COLORS.primary,
  },
  logoutBtn: {
    margin: '16px',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    background: '#f4f4f4',
    color: COLORS.textPrimary,
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  main: {
    flex: 1,
    marginLeft: '240px',
    padding: '24px 32px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '24px',
  },
  title: {
    margin: 0,
    color: COLORS.textPrimary,
    fontSize: '28px',
    fontWeight: '700',
  },
  subtitle: {
    margin: '6px 0 0',
    color: COLORS.textSecondary,
    fontSize: '14px',
  },
};

export default AdminLayout;
