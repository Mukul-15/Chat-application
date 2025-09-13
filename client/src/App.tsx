import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChatRoom from './pages/ChatRoom';
import { AuthProvider, useAuth } from './context/AuthContext';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  if(!token) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/" element={
          <PrivateRoute><Dashboard/></PrivateRoute>
        }/>
        <Route path="/chat/:chatId" element={<PrivateRoute><ChatRoom/></PrivateRoute>} />
      </Routes>
    </AuthProvider>
  );
}
