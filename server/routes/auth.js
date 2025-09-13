const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

router.post('/register',
  body('email').isEmail(),
  body('password').isLength({ min: 5 }),
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    try {
      const existing = await User.findOne({ where: { email }});
      if(existing) return res.status(400).json({ msg: 'Email in use' });
      const hashed = await bcrypt.hash(password, 10);
      const user_code = 'U' + Math.random().toString(36).slice(2,9).toUpperCase();
      const user = await User.create({ name, email, password: hashed, user_code });
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret');
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, user_code: user.user_code }});
    } catch (err) {
      console.error(err); res.status(500).json({ msg: 'Server error' });
    }
  });

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email }});
    if(!user) return res.status(400).json({ msg: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) return res.status(400).json({ msg: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret');
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, user_code: user.user_code }});
  } catch(err) {
    console.error(err); res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
