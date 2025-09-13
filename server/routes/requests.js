const express = require('express');
const router = express.Router();
const { ChatRequest, Chat, ChatMember } = require('../models');
const { verifyToken } = require('../utils/auth');

router.post('/', verifyToken, async (req, res) => {
  const { to_user } = req.body;
  try {
    const exist = await ChatRequest.findOne({ where: { from_user: req.userId, to_user, status: 'pending' }});
    if(exist) return res.status(400).json({ msg: 'Request already pending' });

    const reqDoc = await ChatRequest.create({ from_user: req.userId, to_user });
    res.json(reqDoc);
  } catch (err) { console.error(err); res.status(500).json({ msg:'Server error' }); }
});

router.get('/', verifyToken, async (req, res) => {
  const reqs = await ChatRequest.findAll({ where: { to_user: req.userId, status: 'pending' }});
  res.json(reqs);
});

router.post('/:id/accept', verifyToken, async (req, res) => {
  const id = req.params.id;
  const reqDoc = await ChatRequest.findByPk(id);
  if(!reqDoc || reqDoc.to_user !== req.userId) return res.status(404).json({ msg:'Not found' });
  reqDoc.status = 'accepted';
  await reqDoc.save();

  const chat = await Chat.create({});
  await ChatMember.create({ chat_id: chat.id, user_id: reqDoc.from_user });
  await ChatMember.create({ chat_id: chat.id, user_id: reqDoc.to_user });

  res.json({ chatId: chat.id });
});

router.post('/:id/reject', verifyToken, async (req, res) => {
  const id = req.params.id;
  const reqDoc = await ChatRequest.findByPk(id);
  if(!reqDoc || reqDoc.to_user !== req.userId) return res.status(404).json({ msg:'Not found' });
  reqDoc.status = 'rejected';
  await reqDoc.save();
  res.json({ ok: true });
});

module.exports = router;
