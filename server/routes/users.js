const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { verifyToken } = require('../utils/auth');
const { Op } = require('sequelize');

router.get('/me', verifyToken, async (req, res) => {
  const user = await User.findByPk(req.userId, { attributes: ['id','name','email','user_code','photoURL']});
  res.json(user);
});

router.get('/search', verifyToken, async (req, res) => {
  const q = req.query.q || '';
  const users = await User.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.like]: `%${q}%` } },
        { email: { [Op.like]: `%${q}%` } },
        { user_code: { [Op.like]: `%${q}%` } }
      ]
    },
    attributes: ['id','name','email','user_code','photoURL']
  });
  res.json(users.filter(u => u.id !== req.userId));
});

module.exports = router;
