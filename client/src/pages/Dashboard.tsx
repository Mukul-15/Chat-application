import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard(){
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(()=> {
    const fetchReqs = async () => {
      try {
        const res = await axios.get('/api/requests');
        setRequests(res.data);
      } catch(err) {}
    };
    fetchReqs();
  }, []);

  const doSearch = async () => {
    const res = await axios.get(`/api/users/search?q=${encodeURIComponent(search)}`);
    setResults(res.data);
  };

  const sendRequest = async (toId: number) => {
    await axios.post('/api/requests', { to_user: toId });
    alert('Request sent');
  };

  const accept = async (id:number) => {
    const res = await axios.post(`/api/requests/${id}/accept`);
    alert('Accepted. Chat created: ' + res.data.chatId);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Zentalk</h1>
          <h2 className="text-2xl">Hi, {user?.name}</h2>
          <p>{user?.user_code}</p>
        </div>
        <div>
          <button onClick={logout} className="px-3 py-1 border rounded">Logout</button>
        </div>
      </div>

      <section className="mb-6">
        <h2 className="text-lg mb-2">Search users</h2>
        <div className="flex gap-2">
          <input className="flex-1 p-2 border" value={search} onChange={e => setSearch(e.target.value)} />
          <button onClick={doSearch} className="px-4 bg-blue-600 text-white rounded">Search</button>
        </div>
        <ul>
          {results.map(r => (
            <li key={r.id} className="py-2 flex justify-between">
              <div>{r.name} ({r.user_code})</div>
              <button onClick={()=>sendRequest(r.id)} className="px-3 bg-green-500 text-white rounded">Request Chat</button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg mb-2">Pending Requests</h2>
        <ul>
          {requests.map(req => (
            <li key={req.id} className="py-2 flex justify-between items-center">
              <div>From: {req.from_user}</div>
              <div className="flex gap-2">
                <button onClick={()=>accept(req.id)} className="px-2 bg-green-500 text-white rounded">Accept</button>
                <button className="px-2 bg-red-400 text-white rounded">Reject</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-lg">Your Chats</h2>
        <Link to="/chat/1" className="text-blue-500">Open sample chat (replace with dynamic chat list)</Link>
      </section>
    </div>
  );
}
