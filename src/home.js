import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './home.css';

// Import icons from lucide-react
import { Target, Trophy, Zap, Users, Star, TrendingUp, Gamepad2, Play, ArrowRight, Shield, Sparkles, LayoutDashboard } from 'lucide-react';

const Home = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [particles, setParticles] = useState([]);

  const features = [
    {
      icon: <Target size={24} />,
      title: "Smart Task Management",
      description: "Organize tasks by urgency and importance with our intuitive categorization system",
    },
    {
      icon: <Trophy size={24} />,
      title: "Reward System",
      description: "Earn XP, unlock achievements, and collect rare loot for completing tasks",
    },
    {
      icon: <Zap size={24} />,
      title: "Progress Tracking",
      description: "Visual progress bars and statistics to keep you motivated and on track",
    },
    {
      icon: <Users size={24} />,
      title: "Challenges & Leaderboards",
      description: "Compete with friends and join daily challenges to boost productivity",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));
      setParticles(newParticles);
    };
    generateParticles();
  }, []);

  return (
    <div className="home-container">
      {/* Background particles */}
      <div className="particles-container">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.id * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="home-header">
        {/* ... header content ... */}
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="badge">
          <Sparkles size={16} />
          <span>Level Up Your Productivity</span>
        </div>

        <h1 className="hero-title">
          Turn Your Tasks Into
          <span className="gradient-text">Epic Quests</span>
        </h1>

        <p className="hero-subtitle">
          Transform boring to-do lists into an engaging RPG experience. Earn XP, unlock achievements, collect loot,
          and level up your productivity with Questify's gamified task management.
        </p>

        <div className="hero-actions">
          <Link to="/dashboard" className="primary-button">
            <Play size={20} />
            <span>Start Your Quest</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value purple">10K+</div>
            <div className="stat-label">Active Questers</div>
          </div>
          <div className="stat-item">
            <div className="stat-value pink">1M+</div>
            <div className="stat-label">Tasks Completed</div>
          </div>
          <div className="stat-item">
            <div className="stat-value orange">99.9%</div>
            <div className="stat-label">Uptime</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Game-Changing Features</h2>
          <p className="section-subtitle">Everything you need to gamify your productivity</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`feature-card ${currentFeature === index ? "active-feature" : ""}`}
              onClick={() => setCurrentFeature(index)}
            >
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Level Up?</h2>
          <p className="cta-subtitle">
            Join thousands of productivity heroes who've transformed their daily tasks into epic adventures.
          </p>
          <Link to="/dashboard" className="primary-button">
            <span>Begin Your Journey</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
