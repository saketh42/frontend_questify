import { useState } from 'react';
import { useUser } from './data/UserFileStore';
import './questify.css';

export default function Dashboard() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newTask, setNewTask] = useState('');
  const [deletingTaskId, setDeletingTaskId] = useState(null); // Track which task is being deleted

  // Use global state
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

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(username, password);
    if (result.success) {
      setUsername('');
      setPassword('');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const result = await register(username, password);
    if (result.success) {
      setUsername('');
      setPassword('');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    const result = await addTask(newTask.trim());
    if (result.success) {
      setNewTask('');
    }
  };

  const handleCompleteTask = async (taskId) => {
    await completeTask(taskId);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this quest?')) {
      setDeletingTaskId(taskId); // Set the task being deleted
      const result = await deleteTask(taskId);
      setDeletingTaskId(null); // Reset after deletion completes
      
      if (!result.success) {
        return; // Error is already handled by the deleteTask function
      }
    }
  };

  const handleLogout = () => {
    logout();
    setUsername('');
    setPassword('');
  };

  const handleInputChange = (setter) => (e) => {
    if (error) clearError();
    setter(e.target.value);
  };

  return (
    <div className="container">
      {!isAuthenticated ? (
        <div className="auth-container">
          <h1 className="title">🎯 Questify Dashboard</h1>
          
          {error && <div className="error-message">{error}</div>}

          <form className="user-controls">
            <input
              value={username}
              onChange={handleInputChange(setUsername)}
              placeholder="Enter username"
              className="input"
              disabled={isLoading}
            />
            <input
              type="password"
              value={password}
              onChange={handleInputChange(setPassword)}
              placeholder="Enter password"
              className="input"
              disabled={isLoading}
            />
            <div className="button-group">
              <button 
                onClick={handleLogin} 
                className="button login"
                disabled={isLoading || !username || !password}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
              <button 
                onClick={handleRegister} 
                className="button create"
                disabled={isLoading || !username || !password}
              >
                {isLoading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="user-panel">
          <div className="user-header">
            <div className="user-info">
              <h2>Welcome back, {user.username}! 🎮</h2>
              <button onClick={handleLogout} className="button logout">
                Logout
              </button>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>🏆 Level</h3>
              <p>{user.level}</p>
            </div>
            <div className="stat-card">
              <h3>⚡ XP Points</h3>
              <p>{user.xp}</p>
            </div>
            <div className="stat-card">
              <h3>✅ Completed</h3>
              <p>{stats.completedTasks}</p>
            </div>
            <div className="stat-card">
              <h3>📊 Completion Rate</h3>
              <p>{stats.completionRate}%</p>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="task-section">
            <h2 className="section-title">📝 Your Quests</h2>
            
            <form onSubmit={handleAddTask} className="task-input">
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a new quest..."
                className="input"
                disabled={isLoading}
              />
              <button 
                type="submit"
                className="button add"
                disabled={isLoading || !newTask.trim()}
              >
                {isLoading ? 'Adding...' : 'Add Quest'}
              </button>
            </form>

            {tasks.length === 0 ? (
              <div className="empty-state">
                <p>🎯 No quests yet! Add your first quest above.</p>
              </div>
            ) : (
              <ul className="task-list">
                {tasks.map(task => (
                  <li key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                    <div className="task-content">
                      <span className="task-title">{task.title}</span>
                      {task.completed && <span className="completed-badge">✅ Completed</span>}
                    </div>
                    <div className="task-actions">
                      {!task.completed && (
                        <button
                          onClick={() => handleCompleteTask(task._id)}
                          className="button complete"
                          disabled={isLoading}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="progress-section">
            <h3>📈 Your Progress</h3>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${stats.completionRate}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {stats.completedTasks} of {stats.totalTasks} quests completed
            </p>
          </div>
        </div>
      )}
    </div>
  );
}