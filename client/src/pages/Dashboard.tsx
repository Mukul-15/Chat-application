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
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Zentalk</h1>
                <p className="text-xs text-gray-500">Connect & Chat</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <h2 className="text-lg font-semibold text-gray-800">Hi, {user?.name}</h2>
                <p className="text-sm text-gray-500 font-mono">{user?.userCode}</p>
              </div>
              <button 
                onClick={logout} 
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Search Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Find People</h2>
              
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input 
                    className="w-full px-3 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                    value={search} 
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name..."
                    onKeyPress={(e) => e.key === 'Enter' && doSearch()}
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button 
                  onClick={doSearch} 
                  disabled={loading || !search.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Search Results */}
              {results.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">Search Results</h3>
                  {results.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">
                            {r.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 text-sm">{r.name}</div>
                          <div className="text-xs text-gray-500 font-mono">{r.userCode}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => sendRequest(r.id)} 
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
                      >
                        Request Chat
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Requests */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Pending Requests</h2>

              {requests.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {requests.map(req => (
                    <div key={req.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">?</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 text-sm">Chat Request</div>
                          <div className="text-xs text-gray-500">From: {req.fromUser}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => accept(req.id)} 
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
                        >
                          Accept
                        </button>
                        <button className="px-3 py-1 bg-red-400 hover:bg-red-500 text-white rounded text-xs">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chats Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Your Chats</h2>

              {chats.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm mb-1">No chats yet</p>
                  <p className="text-xs text-gray-400">Search for users to start chatting!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {chats.map(chat => (
                    <Link 
                      key={chat.id} 
                      to={`/chat/${chat.id}`}
                      className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">C</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800 text-sm">
                            Chat {chat.id.slice(-6)}
                          </div>
                          <div className="text-xs text-gray-500">Click to open</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
