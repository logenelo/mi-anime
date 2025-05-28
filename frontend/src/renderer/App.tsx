import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { Home, Calendar, Favorites, Settings, Animes } from './pages';
import Main from './components/Main';

import './App.css';
import { initDB } from 'react-indexed-db-hook';
import { DBConfig } from './DBConfig';
import { DetailProvider } from './contexts/AnimeDetailContext';
import AnimeDetailDrawer from './components/AnimeDetailDrawer';

initDB(DBConfig);

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route
          element={
            <DetailProvider>
              <Main>
                <Outlet />
              </Main>
            </DetailProvider>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/animes" element={<Animes />} />
          {/* Redirect any unknown paths to the home page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
