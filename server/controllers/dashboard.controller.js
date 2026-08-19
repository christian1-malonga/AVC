const User = require('../models/User');
const Debt = require('../models/Debt');
const { Song, Minute, ReceiptDoc, Probation, Announcement, DuesSetting } = require('../models/core');
const AttendanceSession = require('../models/AttendanceSession');
const Election = require('../models/Election');

exports.get = async (req, res) => {
  const r = req.user.roles;
  const base = { members: await User.countDocuments({ status: 'active' }), pending: await User.countDocuments({ status: 'pending' }) };
  if (r.includes('admin') || r.includes('president')) return res.json({ ...base, outstanding: (await Debt.find({ status: { $ne: 'paid' } })).reduce((a, d) => a + (d.amount - d.paid), 0), currentDues: (await DuesSetting.find().sort('-effectiveFrom'))[0], announcements: await Announcement.countDocuments() });
  if (r.includes('provost')) { const last = await AttendanceSession.findOne().sort('-date'); return res.json({ ...base, lastSession: last, onProbation: await Probation.countDocuments({ status: 'active' }) }); }
  if (r.includes('custodian')) return res.json({ ...base, songs: await Song.countDocuments(), recent: await Song.find().sort('-date').limit(5) });
  if (r.includes('secretary')) return res.json({ ...base, minutes: await Minute.countDocuments(), receipts: await ReceiptDoc.countDocuments() });
  if (r.includes('electoral')) return res.json({ ...base, live: await Election.find({ status: 'live' }), drafts: await Election.find({ status: 'draft' }) });
  const debts = await Debt.find({ memberId: req.user._id.toString() });
  return res.json({ myOutstanding: debts.reduce((a, d) => a + (d.amount - d.paid), 0), announcements: await Announcement.find().sort('-date') });
};