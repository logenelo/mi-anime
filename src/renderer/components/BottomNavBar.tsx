import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { key: 'home', label: 'Home', icon: '🏠', path: '/' },
  { key: 'calendar', label: 'Calendar', icon: '📅', path: '/calendar' },
  { key: 'favorites', label: 'My Favor', icon: '⭐', path: '/favorites' },
  { key: 'settings', label: 'Settings', icon: '⚙️', path: '/settings' },
];

const BottomNavBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current tab from path
  const current = navItems.find((item) =>
    item.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.path),
  )?.key;

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 56,
        background: '#fff',
        borderTop: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 100,
      }}
    >
      {navItems.map((item) => (
        <button
          key={item.key}
          style={{
            background: 'none',
            border: 'none',
            color: current === item.key ? '#1976d2' : '#888',
            fontWeight: current === item.key ? 'bold' : 'normal',
            fontSize: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          onClick={() => navigate(item.path)}
        >
          <span style={{ fontSize: 22 }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
};

export default BottomNavBar;
