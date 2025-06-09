import { useState } from 'react';
import axios from 'axios';
import './questify.css';

export default function QuestifyApp() {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [newTask, setNewTask] = useState('');

  const fetchUser = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${username}`);
      setUserData(res.data);
    } catch (err) {
      console.error(err);
      alert('User not found');
    }
  };

  const createUser = async () => {
    try {
      const res = await axios.post(`http://localhost:5000/api/users`, { username });
      setUserData(res.data);
    } catch (err) {
      console.error(err);
      alert('Could not create user');
    }
  };

  const addTask = async () => {
    const res = await axios.post(`http://localhost:5000/api/users/${username}/tasks`, {
      title: newTask,
      description: 'Auto-generated',
      dueDate: new Date()
    });
    setUserData(res.data);
    setNewTask('');
  };

  const completeTask = async (taskId) => {
    const res = await axios.put(`http://localhost:5000/api/users/${username}/tasks/${taskId}/complete`);
    setUserData(res.data);
  };

  return (
    <div className="container">
      <h1 className="title">🎯 Questify</h1>

      <div className="user-controls">
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Enter username"
          className="input"
        />
        <button onClick={fetchUser} className="button login">Login</button>
        <button onClick={createUser} className="button create">Create</button>
      </div>

      {userData && (
        <div className="user-panel">
          <p><strong>XP:</strong> {userData.xp}</p>
          <p><strong>Level:</strong> {userData.level}</p>
          <p><strong>Completed Tasks:</strong> {userData.completedTasksCount}</p>

          <h2 className="section-title">📝 Tasks</h2>
          <div className="task-input">
            <input
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              placeholder="New Task"
              className="input"
            />
            <button onClick={addTask} className="button add">Add</button>
          </div>

          <ul className="task-list">
            {userData.currentTasks.map(task => (
              <li key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <span>{task.title}</span>
                {!task.completed && (
                  <button
                    onClick={() => completeTask(task._id)}
                    className="button complete"
                  >Complete</button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 
