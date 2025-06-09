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
  UPDATE_STATS: 'UPDATE_STATS'
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

    // Dispatch the DELETE_TASK action to update the state
    dispatch({ type: actionTypes.DELETE_TASK, payload: taskId });
    
    // If you need to update the user data completely:
    // dispatch({ type: actionTypes.UPDATE_USER, payload: response.data });
    
    return { success: true, data: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to delete task';
    dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
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