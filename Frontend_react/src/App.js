// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import ShortestPathFinder from './components/ShortestPathFinder';
import History from './components/History';
import Navbar from './components/Navbar';
import './App.css';
import useAuth from './hooks/useAuth';

function App() {
  const [isLogin, token, userId, logout] = useAuth();

  return (
    <Router>
      <Box>
        <Navbar logout={logout} />
        <Routes>
          <Route path="/history" element={<History isLogin={isLogin} token={token} userId={userId} logout={logout} />} />
          <Route path="/" element={<ShortestPathFinder isLogin={isLogin} token={token} userId={userId} logout={logout} />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
