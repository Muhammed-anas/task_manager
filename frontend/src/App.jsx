// src/App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function App() {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState({ title: '', description: '' });
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      fetchTasks(token);
    }
  }, []);

  const fetchTasks = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/login' : '/signup';
      const response = await axios.post(`${API_URL}${endpoint}`, formData);
      
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      fetchTasks(response.data.access);
      setFormData({ username: '', email: '', password: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setTasks([]);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      if (editingTask) {
        const response = await axios.put(
          `${API_URL}/tasks/${editingTask.id}`,
          taskForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTasks(tasks.map(t => t.id === editingTask.id ? response.data : t));
        setEditingTask(null);
      } else {
        const response = await axios.post(
          `${API_URL}/tasks`,
          taskForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTasks([response.data, ...tasks]);
      }
      setTaskForm({ title: '', description: '' });
    } catch (err) {
      setError('Failed to save task');
    }
  };

  const handleToggleComplete = async (task) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(
        `${API_URL}/tasks/${task.id}`,
        { ...task, completed: !task.completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.map(t => t.id === task.id ? response.data : t));
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({ title: task.title, description: task.description });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            {isLogin ? 'Login' : 'Sign Up'}
          </h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
            </button>
          </form>

          <p className="text-center mt-4 text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Task Manager</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user.username}!</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </h2>
          <form onSubmit={handleTaskSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
              >
                {editingTask ? 'Update Task' : 'Add Task'}
              </button>
              {editingTask && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingTask(null);
                    setTaskForm({ title: '', description: '' });
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-lg shadow-md p-6 transition duration-200 hover:shadow-lg ${
                task.completed ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                  {task.title}
                </h3>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleComplete(task)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
              </div>
              
              {task.description && (
                <p className={`text-sm mb-4 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                  {task.description}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditTask(task)}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg transition duration-200 text-sm font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition duration-200 text-sm font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No tasks yet. Create your first task above!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;