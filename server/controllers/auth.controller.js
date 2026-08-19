const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, phone: u.phone, roles: u.roles, section: u.section, avatar: u.avatar, status: u.status });

async function issueToken(user, req) {
  const sess = await Session.create({ userId: user._id, userAgent: req.headers['user-agent'], ip: req.ip, expiresAt: new Date(Date.now() + 7 * 864e5) });
  const access = jwt.sign({ id: user._id, sid: sess._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  return { access, user: publicUser(user) };
}

exports.register = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ msg: 'All fields are required' });
    if (await User.findOne({ email })) return res.status(400).json({ msg: 'Email already registered' });
    const user = await User.create({ name, phone, email, passwordHash: await bcrypt.hash(password, 10), status: 'pending' });
    res.json({ msg: 'Registration submitted for approval', user: publicUser(user) });
  } catch (e) { res.status(500).json({ msg: 'Server error' }); }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(400).json({ msg: 'Invalid credentials' });
  if (user.status === 'pending') return res.status(403).json({ msg: 'Account awaiting admin approval' });
  if (user.status === 'deactivated') return res.status(403).json({ msg: 'Account deactivated' });
  res.json(await issueToken(user, req));
};

exports.demo = async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (!user) return res.status(404).json({ msg: 'Demo account not found' });
  if (user.status !== 'active') return res.status(403).json({ msg: 'Account not active' });
  res.json(await issueToken(user, req));
};

exports.google = async (req, res) => {
  const { email, name, avatarUrl, googleId } = req.body;
  if (!email) return res.status(400).json({ msg: 'Google profile missing email' });
  let user = await User.findOne({ email: email.toLowerCase() });
  if (!user) user = await User.create({ name: name || email.split('@')[0], email, googleId, avatar: avatarUrl, passwordHash: await bcrypt.hash('google-oauth-' + (googleId || email), 10), status: 'active' });
  if (user.status !== 'active') return res.status(403).json({ msg: 'Account not active' });
  res.json(await issueToken(user, req));
};

exports.section = async (req, res) => {
  req.user.section = req.body.section;
  await req.user.save();
  res.json({ user: publicUser(req.user) });
};

exports.me = async (req, res) => res.json({ user: publicUser(req.user) });

exports.grantRole = async (req, res) => {
  const { email, role, grant } = req.body;
  const target = await User.findOne({ email });
  if (!target) return res.status(404).json({ msg: 'User not found' });
  target.roles = grant ? [...new Set([...target.roles, role])] : target.roles.filter((r) => r !== role);
  if (!target.roles.length) target.roles = ['member'];
  await target.save();
  res.json({ user: publicUser(target) });
};

exports.approve = async (req, res) => {
  const target = await User.findOne({ email: req.body.email });
  if (!target) return res.status(404).json({ msg: 'User not found' });
  target.status = req.body.approve === false ? 'deactivated' : 'active';
  await target.save();
  res.json({ user: publicUser(target) });
};