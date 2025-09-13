import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register(){
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const nav = useNavigate();

  const handle = async () => {
    setLoading(true);
    setError('');
    
    try {
      await register(name, email, password);
      nav('/');
    } catch(err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h1 className="text-3xl font-bold text-blue-600 mb-2 text-center">Zentalk</h1>
        <h2 className="text-xl mb-4 text-center">Create Account 🚀</h2>
        <div className="mb-4">
          <input 
            className="w-full p-2 border mb-2" 
            placeholder="Enter your full name" 
            value={name} 
            onChange={e=>setName(e.target.value)} 
          />
        </div>
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
            placeholder="Create a password" 
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
          className="w-full bg-green-600 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
        <p className="mt-3 text-center">
          Already have an account? <Link to="/login" className="text-blue-500">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
