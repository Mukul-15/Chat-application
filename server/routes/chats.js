const express = require('express');
const router = express.Router();
const { Chat, ChatMember, Message, User } = require('../models');
const { verifyToken } = require('../utils/auth');
const { Sequelize } = require('sequelize');

router.get('/', verifyToken, async (req, res) => {
  const chats = await Chat.findAll({
    include: [
      { model: User, through: { model: ChatMember }, attributes: ['id','name','user_code','photoURL'] }
    ],
    where: Sequelize.literal(`EXISTS (SELECT 1 FROM chat_members cm WHERE cm.chat_id = Chat.id AND cm.user_id = ${req.userId})`)
  });
  res.json(chats);
});

router.get('/:chatId/messages', verifyToken, async (req, res) => {
  const { chatId } = req.params;
  const msgs = await Message.findAll({ where: { chat_id: chatId }, include: [{ model: User, as: 'sender', attributes: ['id','name','user_code','photoURL'] }], order: [['timestamp','ASC']]});
  res.json(msgs);
});

module.exports = router;
