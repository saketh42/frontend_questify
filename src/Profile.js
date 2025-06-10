import React, { useState } from 'react';
import { useUser } from './data/UserFileStore';
import './profile.css';

const Profile = () => {
  const { user, isLoading, error, updateUserProfile, logout } = useUser();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!user) {
    return (
      <div className="profile-container">
        <h1>Profile</h1>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setFormError('New passwords do not match');
      return;
    }
    
    if (formData.newPassword && formData.newPassword.length < 4) {
      setFormError('Password must be at least 4 characters');
      return;
    }
    
    try {
      const updateData = {
        currentPassword: formData.currentPassword,
      };
      
      if (formData.username !== user.username) {
        updateData.newUsername = formData.username;
      }
      
      if (formData.newPassword) {
        updateData.newPassword = formData.newPassword;
      }
      
      const result = await updateUserProfile(updateData);
      
      if (result.success) {
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        
        // Clear password fields
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setFormError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setFormError('An error occurred while updating your profile');
      console.error(err);
    }
  };

  // Calculate progress to next level
  const currentLevelXP = (user.level - 1) * 100;
  const nextLevelXP = user.level * 100;
  const progressToNextLevel = ((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return (
    <div className="profile-container">
      <h1>🧙‍♂️ Adventurer Profile</h1>
      
      {error && <div className="error-message">{error}</div>}
      {formError && <div className="error-message">{formError}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-container">
            <div className="avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="level-badge">Lvl {user.level}</div>
          </div>
          
          <div className="user-info">
            <h2>{user.username}</h2>
            <div className="level-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progressToNextLevel}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {user.xp - currentLevelXP} / {nextLevelXP - currentLevelXP} XP to Level {user.level + 1}
              </div>
            </div>
          </div>
          
          <button 
            className="edit-button"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
        
        {isEditing ? (
          <form className="edit-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password (leave blank to keep current)</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={!formData.newPassword}
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="save-button"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="stats-container">
            <div className="stats-row">
              <div className="stat-card">
                <h3>🏆 Level</h3>
                <p>{user.level}</p>
              </div>
              <div className="stat-card">
                <h3>⚡ XP Points</h3>
                <p>{user.xp}</p>
              </div>
              <div className="stat-card">
                <h3>✅ Tasks Completed</h3>
                <p>{user.completedTasksCount || 0}</p>
              </div>
            </div>
            
            <div className="account-section">
              <h3>Account Information</h3>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Account Created:</strong> {new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
              
              <button 
                className="logout-button"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;