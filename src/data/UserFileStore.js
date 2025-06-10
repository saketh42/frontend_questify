import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  tasks: [],
  stats: {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    completionRate: 0
  },
  dailyTasks: {
    tasks: [],
    lastUpdated: null
  }
};

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  SET_TASKS: 'SET_TASKS',
  UPDATE_STATS: 'UPDATE_STATS',
  SET_DAILY_TASKS: 'SET_DAILY_TASKS'
};

// Reducer function
const userReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case actionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        tasks: action.payload.currentTasks || []
      };

    case actionTypes.LOGOUT:
      return {
        ...initialState
      };

    case actionTypes.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };

    case actionTypes.SET_TASKS:
      const tasks = action.payload;
      const completedTasks = tasks.filter(task => task.completed).length;
      const pendingTasks = tasks.length - completedTasks;
      const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

      return {
        ...state,
        tasks,
        stats: {
          totalTasks: tasks.length,
          completedTasks,
          pendingTasks,
          completionRate: Math.round(completionRate)
        }
      };

    case actionTypes.ADD_TASK:
      const newTasks = [...state.tasks, action.payload];
      return {
        ...state,
        tasks: newTasks
      };

    case actionTypes.UPDATE_TASK:
      const updatedTasks = state.tasks.map(task =>
        task._id === action.payload._id ? action.payload : task
      );
      return {
        ...state,
        tasks: updatedTasks
      };

    case actionTypes.DELETE_TASK:
      const filteredTasks = state.tasks.filter(task => task._id !== action.payload);
      return {
        ...state,
        tasks: filteredTasks
      };

    case actionTypes.SET_DAILY_TASKS:
      return {
        ...state,
        dailyTasks: action.payload,
        isLoading: false
      };

    default:
      return state;
  }
};

// Create context
const UserContext = createContext();

// Custom hook to use the context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Provider component
export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // API base URL
  const API_BASE_URL = 'https://backend-questify.onrender.com/api';

  // Actions
  const actions = {
    // Authentication actions
    login: async (username, password) => {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      dispatch({ type: actionTypes.CLEAR_ERROR });

      try {
        const response = await axios.post(`${API_BASE_URL}/users/login`, {
          username,
          password
        });

        dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: response.data });
        
        // Store user data in localStorage for persistence
        localStorage.setItem('questifyUser', JSON.stringify(response.data));
        
        return { success: true, data: response.data };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Invalid username or password';
        dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
        return { success: false, error: errorMessage };
      }
    },

    register: async (username, password) => {
      if (password.length < 4) {
        const errorMessage = 'Password must be at least 4 characters long';
        dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
        return { success: false, error: errorMessage };
      }

      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      dispatch({ type: actionTypes.CLEAR_ERROR });

      try {
        const response = await axios.post(`${API_BASE_URL}/users`, {
          username,
          password
        });

        dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: response.data });
        
        // Store user data in localStorage for persistence
        localStorage.setItem('questifyUser', JSON.stringify(response.data));
        
        return { success: true, data: response.data };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Could not create user - username might already exist';
        dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
        return { success: false, error: errorMessage };
      }
    },

    logout: () => {
      localStorage.removeItem('questifyUser');
      dispatch({ type: actionTypes.LOGOUT });
    },

    // Task actions
    addTask: async (taskTitle, description = 'Auto-generated') => {
      if (!state.user?.username) return { success: false, error: 'User not authenticated' };

      dispatch({ type: actionTypes.SET_LOADING, payload: true });

      try {
        const response = await axios.post(`${API_BASE_URL}/users/${state.user.username}/tasks`, {
          title: taskTitle,
          description,
          dueDate: new Date()
        });

        dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: response.data });
        return { success: true, data: response.data };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to add task';
        dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
        return { success: false, error: errorMessage };
      }
    },

    completeTask: async (taskId) => {
      if (!state.user?.username) return { success: false, error: 'User not authenticated' };

      dispatch({ type: actionTypes.SET_LOADING, payload: true });

      try {
        const response = await axios.put(`${API_BASE_URL}/users/${state.user.username}/tasks/${taskId}/complete`);

        dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: response.data });
        return { success: true, data: response.data };
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to complete task';
        dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
        return { success: false, error: errorMessage };
      }
    },

    deleteTask: async (taskId) => {
      if (!state.user?.username) return { success: false, error: 'User not authenticated' };

      dispatch({ type: actionTypes.SET_LOADING, payload: true });

      try {
        const response = await axios.delete(`${API_BASE_URL}/users/${state.user.username}/tasks/${taskId}`);

        // Update the complete user data from the response
        dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: response.data });
        
        // Also dispatch the DELETE_TASK action to immediately update the UI
        dispatch({ type: actionTypes.DELETE_TASK, payload: taskId });
        
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
        return { success: true, data: response.data };
      } catch (error) {
        const errorMessage = error.response?.data?.error || 'Failed to delete task';
        dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
        return { success: false, error: errorMessage };
      }
    },

    editTask: async (taskId, updatedData) => {
      if (!state.user?.username) return { success: false, error: 'User not authenticated' };

      dispatch({ type: actionTypes.SET_LOADING, payload: true });

      try {
        const response = await axios.put(
          `${API_BASE_URL}/users/${state.user.username}/tasks/${taskId}`, 
          updatedData
        );

        dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: response.data });
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
        return { success: true, data: response.data };
      } catch (error) {
        const errorMessage = error.response?.data?.error || 'Failed to update task';
        dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
        return { success: false, error: errorMessage };
      }
    },

    // Utility actions
    clearError: () => {
      dispatch({ type: actionTypes.CLEAR_ERROR });
    },

    refreshUserData: async () => {
      if (!state.user?.username) return;

      try {
        const response = await axios.get(`${API_BASE_URL}/users/${state.user.username}`);
        dispatch({ type: actionTypes.UPDATE_USER, payload: response.data });
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    },

    getDailyTasks: async () => {
      if (!state.user?.username) return { success: false, error: 'User not authenticated' };

      dispatch({ type: actionTypes.SET_LOADING, payload: true });

      try {
        console.log(`Fetching daily tasks for user: ${state.user.username}`);
        const response = await axios.get(`${API_BASE_URL}/dailyTasks/user/${state.user.username}`);
        
        console.log('Daily tasks response:', response.data);
        dispatch({ 
          type: actionTypes.SET_DAILY_TASKS, 
          payload: response.data 
        });
        
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Error fetching daily tasks:', error);
        const errorMessage = error.response?.data?.error || 'Failed to fetch daily tasks';
        dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
        return { success: false, error: errorMessage };
      }
    },

    completeDailyTask: async (taskIndex) => {
      if (!state.user?.username) return { success: false, error: 'User not authenticated' };

      dispatch({ type: actionTypes.SET_LOADING, payload: true });

      try {
        console.log(`Completing daily task at index ${taskIndex} for user: ${state.user.username}`);
        const response = await axios.put(
          `${API_BASE_URL}/dailyTasks/user/${state.user.username}/complete/${taskIndex}`
        );
        
        console.log('Task completion response:', response.data);
        
        // Update both the user data and the daily tasks
        dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: response.data });
        
        // Also update the daily tasks specifically
        if (response.data.dailyTasks) {
          dispatch({ 
            type: actionTypes.SET_DAILY_TASKS, 
            payload: response.data.dailyTasks 
          });
        }
        
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
        return { success: true, data: response.data };
      } catch (error) {
        console.error('Error completing daily task:', error);
        const errorMessage = error.response?.data?.error || 'Failed to complete daily task';
        dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
        return { success: false, error: errorMessage };
      }
    },

    updateUserProfile: async (updateData) => {
      if (!state.user?.username) return { success: false, error: 'User not authenticated' };

      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      dispatch({ type: actionTypes.CLEAR_ERROR });

      try {
        const response = await axios.put(
          `${API_BASE_URL}/users/${state.user.username}/profile`,
          updateData
        );

        dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: response.data });
        
        // Update localStorage
        localStorage.setItem('questifyUser', JSON.stringify(response.data));
        
        return { success: true, data: response.data };
      } catch (error) {
        const errorMessage = error.response?.data?.error || 'Failed to update profile';
        dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
        return { success: false, error: errorMessage };
      }
    }
  };

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('questifyUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: userData });
      } catch (error) {
        console.error('Failed to load saved user data:', error);
        localStorage.removeItem('questifyUser');
      }
    }
  }, []);

  // Update localStorage when user data changes
  useEffect(() => {
    if (state.user && state.isAuthenticated) {
      localStorage.setItem('questifyUser', JSON.stringify(state.user));
    }
  }, [state.user, state.isAuthenticated]);

  // Calculate stats when tasks change
  useEffect(() => {
    if (state.user?.currentTasks) {
      dispatch({ type: actionTypes.SET_TASKS, payload: state.user.currentTasks });
    }
  }, [state.user?.currentTasks]);

  const contextValue = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    tasks: state.tasks,
    stats: state.stats,
    dailyTasks: state.dailyTasks, // Make sure this is included
    
    // Actions
    ...actions
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
