const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const AttendanceSession = require('../models/AttendanceSession');

exports.create = async (req, res) => {
  const s = await AttendanceSession.create({ title: req.body.title, date: req.body.date, type: req.body.type || 'service', markedBy: req.user.name, markedByRoleAtTime: req.body.roleAtTime });
  res.json(s);
};
exports.qr = async (req, res) => {
  const s = await AttendanceSession.findById(req.params.id);
  const qrToken = jwt.sign({ sid: s._id, qr: true }, process.env.JWT_SECRET, { expiresIn: '90s' }); // expires fast = no screenshot reuse
  s.qrToken = qrToken; s.qrExpires = new Date(Date.now() + 90000); await s.save();
  const qrImage = await QRCode.toDataURL(qrToken);
  res.json({ qrToken, qrImage });
};
exports.checkin = async (req, res) => {
  try {
    const dec = jwt.verify(req.body.qrToken, process.env.JWT_SECRET);
    const s = await AttendanceSession.findById(dec.sid);
    if (!s || s.qrExpires < new Date()) return res.status(410).json({ msg: 'QR expired — ask the Provost for a fresh code' });
    if (s.checkins.some((c) => c.userId === req.user._id.toString())) return res.status(409).json({ msg: 'Already checked in' });
    s.checkins.push({ userId: req.user._id.toString(), time: new Date(), method: 'qr' });
    s.records.set(req.user._id.toString(), 'present');
    await s.save();
    res.json({ msg: `Checked in at ${new Date().toLocaleTimeString()}` });
  } catch { res.status(400).json({ msg: 'Invalid QR for this event' }); }
};
exports.mark = async (req, res) => {
  const s = await AttendanceSession.findById(req.params.id);
  s.records.set(req.body.userId, req.body.status);
  s.markedBy = req.user.name; s.markedByRoleAtTime = req.body.roleAtTime;
  await s.save(); res.json(s);
};
exports.list = async (req, res) => res.json(await AttendanceSession.find().sort('-date'));