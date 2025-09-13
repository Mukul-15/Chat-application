import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();

  const handle = async () => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      login(res.data.token, res.data.user);
      nav('/');
    } catch (err:any) {
      alert(err.response?.data?.msg || 'Login failed');
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
        <button onClick={handle} className="w-full bg-blue-600 text-white p-2 rounded">
          Sign In
        </button>
        <p className="mt-3 text-center">
          Don't have an account? <Link to="/register" className="text-blue-500">Create one</Link>
        </p>
      </div>
    </div>
  );
}
