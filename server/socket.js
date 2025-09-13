const { Message } = require('./models');

const onlineUsers = new Map(); // userId -> socket.id

function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on('user:online', (userId) => {
      onlineUsers.set(String(userId), socket.id);
      socket.userId = userId;
    });

    socket.on('join:chat', (chatId) => {
      socket.join(`chat_${chatId}`);
    });

    socket.on('leave:chat', (chatId) => {
      socket.leave(`chat_${chatId}`);
    });

    socket.on('message:send', async ({ chatId, senderId, text }) => {
      try {
        const msg = await Message.create({ chat_id: chatId, sender_id: senderId, text });
        io.to(`chat_${chatId}`).emit('message:receive', { id: msg.id, chat_id: chatId, sender_id: senderId, text: msg.text, timestamp: msg.timestamp });
      } catch (err) { console.error(err); }
    });

    socket.on('typing', ({ chatId, userId, isTyping }) => {
      socket.to(`chat_${chatId}`).emit('typing', { userId, isTyping });
    });

    socket.on('disconnect', () => {
      if(socket.userId) onlineUsers.delete(String(socket.userId));
      console.log('socket disconnected', socket.id);
    });
  });
}

module.exports = { setupSocket };
