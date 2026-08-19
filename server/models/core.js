const mongoose = require('mongoose');
const S = mongoose.Schema;
module.exports = {
  RoleHistory: mongoose.model('RoleHistory', new S({ userId: String, role: String, granted: String, revoked: String, grantedBy: String, grantedByRoleAtTime: String })),
  AuditLog: mongoose.model('AuditLog', new S({ userId: String, userName: String, roleAtTime: String, action: String, detail: String, time: String })), // append-only: no update/delete routes exist
  DuesSetting: mongoose.model('DuesSetting', new S({ amount: Number, effectiveFrom: String, by: String, roleAtTime: String })),
  Probation: mongoose.model('Probation', new S({ memberId: String, reason: String, start: String, end: String, status: String, history: [{ ev: String, date: String, by: String, roleAtTime: String }] })),
  Announcement: mongoose.model('Announcement', new S({ title: String, body: String, by: String, roleAtTime: String, date: String, pinned: Boolean })),
  DocumentMeta: mongoose.model('DocumentMeta', new S({ title: String, category: String, version: String, desc: String, gridFsId: String, size: String, by: String, roleAtTime: String, date: String })),
  Song: mongoose.model('Song', new S({ title: String, part: String, format: String, size: String, duration: String, tag: String, gridFsId: String, by: String, roleAtTime: String, date: String, version: { type: Number, default: 1 } })),
  Minute: mongoose.model('Minute', new S({ title: String, body: String, by: String, roleAtTime: String, date: String })),
  ReceiptDoc: mongoose.model('ReceiptDoc', new S({ title: String, amount: Number, category: String, by: String, roleAtTime: String, date: String })),
  Due: mongoose.model('Due', new S({ type: String, memberId: String, period: String, amount: Number, date: String, by: String, roleAtTime: String })),
};