import React, { useEffect, useState } from 'react';
import { useUser } from '../data/UserFileStore';
import axios from 'axios';

const DailyTasks = () => {
  const { 
    user, 
    isLoading, 
    dailyTasks = { tasks: [] }, 
    getDailyTasks, 
    completeDailyTask 
  } = useUser();
  
  const [fetchError, setFetchError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.username) {
      getDailyTasks();
    }
  }, [user?.username]);

  const handleCompleteTask = async (index) => {
    try {
      setRefreshing(true); // Show loading state
      const result = await completeDailyTask(index);
      if (!result.success) {
        setFetchError(`Failed to complete task: ${result.error}`);
      }
    } catch (error) {
      console.error('Error completing task:', error);
      setFetchError('Failed to complete task. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const forceRefreshTasks = async () => {
    if (!user?.username) return;
    
    setRefreshing(true);
    try {
      // This is a direct API call to force refresh tasks
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://backend-questify.onrender.com/api';
      await axios.post(`${API_BASE_URL}/dailyTasks/user/${user.username}/refresh`);
      
      // Now get the refreshed tasks
      await getDailyTasks();
      setFetchError(null);
    } catch (error) {
      console.error('Error refreshing tasks:', error);
      setFetchError('Failed to refresh tasks. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  // Format date to show when tasks refresh
  const formatNextRefresh = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) return null;

  return (
    <div className="daily-tasks-section">
      <div className="section-header">
        <h2 className="section-title">🌟 Daily Quests</h2>
        {/* <button 
          onClick={forceRefreshTasks} 
          className="button refresh-button"
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Get New Tasks'}
        </button> */}
      </div>
      <p className="refresh-info">New quests every day at {formatNextRefresh()}</p>
      
      {fetchError && (
        <div className="error-message">
          {fetchError}
          <button 
            onClick={() => getDailyTasks()} 
            className="button retry"
          >
            Retry
          </button>
        </div>
      )}
      
      {isLoading || refreshing ? (
        <div className="loading">Loading daily quests...</div>
      ) : !dailyTasks || dailyTasks.tasks.length === 0 ? (
        <div className="empty-state">
          <p>No daily quests available today. Click "Get New Tasks" to generate some!</p>
        </div>
      ) : (
        <ul className="daily-task-list">
          {dailyTasks.tasks.map((task, index) => (
            <li key={index} className={`daily-task-item ${task.completed ? 'completed' : ''}`}>
              <div className="task-content">
                <span className="task-title">{task.title}</span>
                {task.completed && <span className="completed-badge">✅ Completed</span>}
              </div>
              {!task.completed && (
                <button
                  onClick={() => handleCompleteTask(index)}
                  className="button complete"
                  disabled={isLoading || refreshing}
                >
                  Complete (+15 XP)
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DailyTasks;

