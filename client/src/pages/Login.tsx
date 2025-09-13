import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const handle = async () => {
    setLoading(true);
    setError('');
    
    try {
      await login(email, password);
      nav('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h1 className="text-3xl font-bold text-blue-600 mb-2 text-center">Zentalk</h1>
        <h2 className="text-xl mb-4 text-center">Welcome Back ✨</h2>
        <div className="mb-4">
          <input 
            className="w-full p-2 border mb-2" 
            placeholder="Enter your email" 
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
          />
        </div>
        <div className="mb-4">
          <input 
            className="w-full p-2 border mb-2" 
            placeholder="Enter your password" 
            type="password" 
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
          />
        </div>
        
        {error && (
          <div className="text-red-600 text-sm text-center mb-2">{error}</div>
        )}
        
        <button 
          onClick={handle} 
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p className="mt-3 text-center">
          Don't have an account? <Link to="/register" className="text-blue-500">Create one</Link>
        </p>
      </div>
    </div>
  );
}
