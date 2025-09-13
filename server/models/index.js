const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(
  process.env.DB_NAME || 'chat_app',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  }
);

const User = sequelize.define('User', {
  user_code: { type: DataTypes.STRING, unique: true },
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING,
  photoURL: DataTypes.STRING,
  last_seen: DataTypes.DATE
}, {
  tableName: 'users',
  timestamps: false
});

const ChatRequest = sequelize.define('ChatRequest', {
  from_user: DataTypes.INTEGER,
  to_user: DataTypes.INTEGER,
  status: { type: DataTypes.ENUM('pending','accepted','rejected'), defaultValue: 'pending' }
}, {
  tableName: 'chat_requests',
  timestamps: false
});

const Chat = sequelize.define('Chat', {}, { tableName: 'chats', timestamps: false });
const ChatMember = sequelize.define('ChatMember', {}, { tableName: 'chat_members', timestamps: false });
const Message = sequelize.define('Message', {
  text: DataTypes.TEXT,
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  timestamp: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
}, { tableName: 'messages', timestamps: false });

User.hasMany(ChatRequest, { foreignKey: 'from_user' });
User.hasMany(ChatRequest, { foreignKey: 'to_user' });

Chat.belongsToMany(User, { through: ChatMember, foreignKey: 'chat_id', otherKey: 'user_id' });
User.belongsToMany(Chat, { through: ChatMember, foreignKey: 'user_id', otherKey: 'chat_id' });

Chat.hasMany(Message, { foreignKey: 'chat_id' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

module.exports = {
  sequelize,
  User, ChatRequest, Chat, ChatMember, Message
};
