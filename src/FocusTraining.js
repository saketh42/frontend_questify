import React, { useState, useEffect, useRef } from 'react';
import './focusTraining.css';

const FocusTraining = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [sessions, setSessions] = useState(0);
  const [totalXP, setTotalXP] = useState(() => {
    return parseInt(localStorage.getItem('userXP') || '0');
  });
  const intervalRef = useRef(null);

  const modes = {
    work: { duration: 25 * 60, label: 'Focus Time', xp: 50 },
    shortBreak: { duration: 5 * 60, label: 'Short Break', xp: 10 },
    longBreak: { duration: 15 * 60, label: 'Long Break', xp: 25 }
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, timeLeft]);

  const handleSessionComplete = () => {
    setIsActive(false);
    const xpGained = modes[mode].xp;
    const newXP = totalXP + xpGained;
    setTotalXP(newXP);
    localStorage.setItem('userXP', newXP.toString());
    
    if (mode === 'work') {
      setSessions(prev => prev + 1);
      // After 4 work sessions, suggest long break
      if ((sessions + 1) % 4 === 0) {
        setMode('longBreak');
      } else {
        setMode('shortBreak');
      }
    } else {
      setMode('work');
    }
    
    setTimeLeft(modes[mode === 'work' ? (sessions % 4 === 3 ? 'longBreak' : 'shortBreak') : 'work'].duration);
    
    // Show notification
    if (Notification.permission === 'granted') {
      new Notification(`${modes[mode].label} completed! +${xpGained} XP`);
    }
  };

  const startTimer = () => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(modes[mode].duration);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setTimeLeft(modes[newMode].duration);
    setIsActive(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalTime = modes[mode].duration;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  return (
    <div className="focus-training">
      <div className="focus-header">
        <h1>🧠 Focus Training</h1>
        <div className="xp-display">
          <span className="xp-icon">⭐</span>
          <span className="xp-amount">{totalXP} XP</span>
        </div>
      </div>

      <div className="pomodoro-container">
        <div className="mode-selector">
          <button 
            className={mode === 'work' ? 'active' : ''}
            onClick={() => switchMode('work')}
          >
            Focus (25min)
          </button>
          <button 
            className={mode === 'shortBreak' ? 'active' : ''}
            onClick={() => switchMode('shortBreak')}
          >
            Short Break (5min)
          </button>
          <button 
            className={mode === 'longBreak' ? 'active' : ''}
            onClick={() => switchMode('longBreak')}
          >
            Long Break (15min)
          </button>
        </div> 

        <div className="timer-display">
          <div className="progress-ring">
            <svg className="progress-svg" viewBox="0 0 120 120">
              <circle
                className="progress-background"
                cx="60"
                cy="60"
                r="54"
                fill="transparent"
                stroke="#e0e0e0"
                strokeWidth="8"
              />
              <circle
                className="progress-bar"
                cx="60"
                cy="60"
                r="54"
                fill="transparent"
                stroke={mode === 'work' ? '#ff6b6b' : '#4ecdc4'}
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - getProgress() / 100)}`}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="timer-text">
              <div className="time">{formatTime(timeLeft)}</div>
              <div className="mode-label">{modes[mode].label}</div>
            </div>
          </div>
        </div>

        <div className="timer-controls">
          {!isActive ? (
            <button className="control-btn start" onClick={startTimer}>
              ▶️ Start
            </button>
          ) : (
            <button className="control-btn pause" onClick={pauseTimer}>
              ⏸️ Pause
            </button>
          )}
          <button className="control-btn reset" onClick={resetTimer}>
            🔄 Reset
          </button>
        </div>

        <div className="session-stats">
          <div className="stat">
            <span className="stat-number">{sessions}</span>
            <span className="stat-label">Sessions Today</span>
          </div>
          <div className="stat">
            <span className="stat-number">{Math.floor(sessions * 25)} min</span>
            <span className="stat-label">Focus Time</span>
          </div>
          <div className="stat">
            <span className="stat-number">+{modes[mode].xp} XP</span>
            <span className="stat-label">Next Reward</span>
          </div>
        </div>
      </div>

      <div className="focus-tips">
        <h3>💡 Focus Tips</h3>
        <ul>
          <li>Find a quiet, comfortable workspace</li>
          <li>Turn off notifications during focus sessions</li>
          <li>Keep water and snacks nearby</li>
          <li>Take breaks seriously - they help maintain focus</li>
          <li>Celebrate completed sessions!</li>
        </ul>
      </div>
    </div>
  );
};

export default FocusTraining;