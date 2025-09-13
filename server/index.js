require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const chatRequestRoutes = require('./routes/requests');
const chatRoutes = require('./routes/chats');
const { setupSocket } = require('./socket');

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || '*'
}));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', chatRequestRoutes);
app.use('/api/chats', chatRoutes);

const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: { origin: process.env.FRONTEND_ORIGIN || '*' }
});
setupSocket(io);

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: false }).then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
}).catch(err => {
  console.error('DB sync error:', err);
});
