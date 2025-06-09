import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">🎯 Welcome to Questify</h1>
        <p className="hero-subtitle">
          Transform your daily tasks into an exciting quest! 
          Level up by completing tasks and earn XP points.
        </p>
        
        <div className="features">
          <div className="feature">
            <h3>📈 Level Up System</h3>
            <p>Gain XP and level up as you complete tasks</p>
          </div>
          <div className="feature">
            <h3>🎮 Gamified Experience</h3>
            <p>Turn productivity into a fun game</p>
          </div>
          <div className="feature">
            <h3>📝 Task Management</h3>
            <p>Organize and track your daily tasks</p>
          </div>
        </div>

        <Link to="/dashboard" className="cta-button">
          Start Your Quest
        </Link>
      </div>
    </div>
  );
};

export default Home;