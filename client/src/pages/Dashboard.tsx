import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  searchUsers, 
  createChatRequest, 
  getChatRequests, 
  acceptChatRequest, 
  getUserChats,
  subscribeToUserChats 
} from '../firebase/firestore';

export default function Dashboard(){
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchRequests();
      fetchChats();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const reqs = await getChatRequests(user.id);
      setRequests(reqs);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  const fetchChats = async () => {
    try {
      const userChats = await getUserChats(user.id);
      setChats(userChats);
    } catch (err) {
      console.error('Error fetching chats:', err);
    }
  };

  const doSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const searchResults = await searchUsers(search);
      setResults(searchResults.filter(r => r.id !== user.id));
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (toUserId: string) => {
    try {
      await createChatRequest(user.id, toUserId);
      alert('Request sent');
    } catch (err) {
      console.error('Error sending request:', err);
      alert('Failed to send request');
    }
  };

  const accept = async (requestId: string) => {
    try {
      const chatId = await acceptChatRequest(requestId);
      alert('Accepted. Chat created!');
      fetchRequests(); // Refresh requests
      fetchChats(); // Refresh chats
    } catch (err) {
      console.error('Error accepting request:', err);
      alert('Failed to accept request');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Zentalk</h1>
          <h2 className="text-2xl">Hi, {user?.name}</h2>
          <p>{user?.userCode}</p>
        </div>
        <div>
          <button onClick={logout} className="px-3 py-1 border rounded">Logout</button>
        </div>
      </div>

      <section className="mb-6">
        <h2 className="text-lg mb-2">Search users</h2>
        <div className="flex gap-2">
          <input 
            className="flex-1 p-2 border" 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name..."
          />
          <button 
            onClick={doSearch} 
            disabled={loading}
            className="px-4 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        <ul className="mt-2">
          {results.map(r => (
            <li key={r.id} className="py-2 flex justify-between items-center border-b">
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-sm text-gray-500">{r.userCode}</div>
              </div>
              <button 
                onClick={() => sendRequest(r.id)} 
                className="px-3 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Request Chat
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-lg mb-2">Pending Requests</h2>
        <ul>
          {requests.map(req => (
            <li key={req.id} className="py-2 flex justify-between items-center border-b">
              <div>From: {req.fromUser}</div>
              <div className="flex gap-2">
                <button 
                  onClick={() => accept(req.id)} 
                  className="px-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Accept
                </button>
                <button className="px-2 bg-red-400 text-white rounded hover:bg-red-500">
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-lg mb-2">Your Chats</h2>
        <ul>
          {chats.map(chat => (
            <li key={chat.id} className="py-2 border-b">
              <Link 
                to={`/chat/${chat.id}`} 
                className="text-blue-500 hover:text-blue-700"
              >
                Chat {chat.id}
              </Link>
            </li>
          ))}
        </ul>
        {chats.length === 0 && (
          <p className="text-gray-500">No chats yet. Search for users to start chatting!</p>
        )}
      </section>
    </div>
  );
}
