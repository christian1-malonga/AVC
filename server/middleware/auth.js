const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');
module.exports = async (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const dec = jwt.verify(token, process.env.JWT_SECRET);
    const sess = await Session.findById(dec.sid);
    if (!sess || sess.expiresAt < new Date()) return res.status(401).json({ msg: 'Session expired' });
    req.user = await User.findById(dec.id);
    if (!req.user) return res.status(401).json({ msg: 'User no longer exists' });
    next();
  } catch (e) { res.status(401).json({ msg: 'Token is not valid' }); }
};