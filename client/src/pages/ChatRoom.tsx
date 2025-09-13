import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getChatMessages, 
  sendMessage, 
  subscribeToChatMessages 
} from '../firebase/firestore';

export default function ChatRoom(){
  const { chatId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!chatId || !user) return;

    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        const msgs = await getChatMessages(chatId);
        setMessages(msgs);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();

    // Subscribe to real-time messages
    const unsubscribe = subscribeToChatMessages(chatId, (newMessages) => {
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [chatId, user]);

  const send = async () => {
    if (!text.trim() || !user || !chatId) return;
    
    setLoading(true);
    try {
      await sendMessage(chatId, user.uid, text);
      setText('');
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 h-screen flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-blue-600">Zentalk</h1>
        <p className="text-gray-600">Chat Room</p>
      </div>
      
      <div className="flex-1 overflow-auto border rounded-lg p-4 mb-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((m: any) => (
            <div 
              key={m.id} 
              className={`mb-3 flex ${m.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  m.senderId === user.uid 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white border'
                }`}
              >
                <div className="text-sm">{m.text}</div>
                <div className={`text-xs mt-1 ${
                  m.senderId === user.uid ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {m.timestamp?.toDate ? 
                    m.timestamp.toDate().toLocaleString() : 
                    new Date(m.timestamp).toLocaleString()
                  }
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="flex gap-2">
        <input 
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
          value={text} 
          onChange={e => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button 
          onClick={send} 
          disabled={loading || !text.trim()}
          className="px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
