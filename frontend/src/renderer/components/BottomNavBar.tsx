import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import StarIcon from '@mui/icons-material/Star';
import SettingsIcon from '@mui/icons-material/Settings';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';

const navItems = [
  {
    key: 'calendar',
    label: '行事曆',
    icon: <CalendarMonthIcon />,
    path: '/calendar',
  },
  { key: 'favorites', label: '收藏', icon: <StarIcon />, path: '/favorites' },
  { key: 'home', label: '首頁', icon: <HomeIcon />, path: '/' },
  {
    key: 'animes',
    label: '動畫',
    icon: <TableChartOutlinedIcon />,
    path: '/animes',
  },
  { key: 'settings', label: '設定', icon: <SettingsIcon />, path: '/settings' },
];

const BottomNavBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 根據當前路徑決定選中的 tab
  const currentIndex = navItems.findIndex((item) =>
    item.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.path),
  );

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        boxShadow: '0 0 16px 0 rgba(0,0,0,0.06)',
      }}
      elevation={3}
    >
      <BottomNavigation
        value={currentIndex}
        onChange={(_, newValue) => {
          navigate(navItems[newValue].path);
        }}
        sx={{
          height: 64,
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.key}
            label={item.label}
            icon={item.icon}
            value={navItems.findIndex((i) => i.key === item.key)}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNavBar;
