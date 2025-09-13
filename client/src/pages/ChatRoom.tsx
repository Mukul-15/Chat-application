import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function ChatRoom(){
  const { chatId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const socketRef = useRef<any>(null);

  useEffect(()=> {
    const fetchMessages = async () => {
      const res = await axios.get(`/api/chats/${chatId}/messages`);
      setMessages(res.data);
    };
    fetchMessages();
  }, [chatId]);

  useEffect(()=> {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('user:online', user.id);
    socketRef.current.emit('join:chat', chatId);

    socketRef.current.on('message:receive', (msg: any) => {
      setMessages(prev => [...prev, msg]);
    });

    socketRef.current.on('typing', ({ userId, isTyping }: any) => {
      // show typing indicator if needed
    });

    return () => {
      socketRef.current.emit('leave:chat', chatId);
      socketRef.current.disconnect();
    };
  }, [chatId]);

  const send = () => {
    if(!text) return;
    socketRef.current.emit('message:send', { chatId: Number(chatId), senderId: user.id, text });
    setText('');
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-blue-600">Zentalk</h1>
        <p className="text-gray-600">Chat Room</p>
      </div>
      <div className="h-[60vh] overflow-auto border p-2 mb-3">
        {messages.map((m:any) => (
          <div key={m.id} className={`p-2 my-1 ${m.sender_id === user.id ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`}>
            <div>{m.text}</div>
            <small className="text-xs text-gray-500">{new Date(m.timestamp).toLocaleString()}</small>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="flex-1 p-2 border" value={text} onChange={e => setText(e.target.value)} />
        <button onClick={send} className="px-4 bg-blue-600 text-white rounded">Send</button>
      </div>
    </div>
  );
}
