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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">Z</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Zentalk
                </h1>
                <p className="text-sm text-gray-500">Connect & Chat</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <h2 className="text-xl font-semibold text-gray-800">Hi, {user?.name}</h2>
                <p className="text-sm text-gray-500 font-mono">{user?.userCode}</p>
              </div>
              <button 
                onClick={logout} 
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Search Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Find People</h2>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input 
                    className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                    value={search} 
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name..."
                    onKeyPress={(e) => e.key === 'Enter' && doSearch()}
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button 
                  onClick={doSearch} 
                  disabled={loading || !search.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Searching...</span>
                    </div>
                  ) : (
                    'Search'
                  )}
                </button>
              </div>

              {/* Search Results */}
              {results.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-lg font-medium text-gray-700">Search Results</h3>
                  {results.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {r.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{r.name}</div>
                          <div className="text-sm text-gray-500 font-mono">{r.userCode}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => sendRequest(r.id)} 
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
                      >
                        Request Chat
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Requests */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Pending Requests</h2>
                {requests.length > 0 && (
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                    {requests.length}
                  </span>
                )}
              </div>

              {requests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map(req => (
                    <div key={req.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">?</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">Chat Request</div>
                          <div className="text-sm text-gray-500">From: {req.fromUser}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => accept(req.id)} 
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 font-medium"
                        >
                          Accept
                        </button>
                        <button className="px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg transition-colors duration-200 font-medium">
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
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Your Chats</h2>
                {chats.length > 0 && (
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                    {chats.length}
                  </span>
                )}
              </div>

              {chats.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-2">No chats yet</p>
                  <p className="text-sm text-gray-400">Search for users to start chatting!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chats.map(chat => (
                    <Link 
                      key={chat.id} 
                      to={`/chat/${chat.id}`}
                      className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200 group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">C</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800 group-hover:text-purple-600 transition-colors duration-200">
                            Chat {chat.id.slice(-6)}
                          </div>
                          <div className="text-sm text-gray-500">Click to open</div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
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
