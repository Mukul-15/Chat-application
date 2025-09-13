const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const header = req.headers['authorization'];
  if(!header) return res.status(401).json({ msg: 'No token' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(403).json({ msg: 'Invalid token' });
  }
};
