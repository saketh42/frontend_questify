import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './home.js';
import Dashboard from './dashboard.js';
import FocusTraining from './FocusTraining.js';
import Shop from './Shop.js';
import Profile from './Profile.js';
import ChatBot from './components/ChatBot';
import './App.css';
import { useUser } from './data/UserFileStore';

function App() {
    const {
      user,
      isAuthenticated,
      isLoading,
      error,
      tasks,
      stats,
      login,
      register,
      logout,
      addTask,
      completeTask,
      deleteTask,
      clearError
    } = useUser();

  const location = useLocation();
  const [userXP, setUserXP] = useState(() => {
    return parseInt(localStorage.getItem('userXP') || '0');
  });
  const [showBonusPopup, setShowBonusPopup] = useState(false);
  const [bonusXP, setBonusXP] = useState(null);

  // Save XP to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('userXP', userXP.toString());
  }, [userXP]);

  // Random XP every 5 mins
  useEffect(() => {
    const interval = setInterval(() => {
      const bonus = Math.floor(Math.random() * 81) + 20; // 20–100 XP
      setUserXP(prev => prev + bonus);
      setBonusXP(bonus);
      setShowBonusPopup(true);
      setTimeout(() => setShowBonusPopup(false), 4000);
    }, 30000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <nav className="navbar">
          <div className="nav-brand">
            <Link to="/">🎯 Questify</Link>
          </div>
          <ul className="nav-links">
            <li>
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
            </li>
            <li>
              <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link>
            </li>
            <li>
              <Link to="/focus" className={location.pathname === '/focus' ? 'active' : ''}>Focus Training</Link>
            </li>
            <li>
              <Link to="/shop" className={location.pathname === '/shop' ? 'active' : ''}>Shop</Link>
            </li>
            {isAuthenticated && (
              <li>
                <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>Profile</Link>
              </li>
            )}
          </ul>
        </nav>
      </header>

      <main className="main-content">
        {showBonusPopup && isAuthenticated && (
          <div className="bonus-popup">🎁 +{bonusXP} Bonus XP earned!</div>
        )}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/focus" element={<FocusTraining />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      
      <ChatBot />
    </div>
  );
}

export default App;


