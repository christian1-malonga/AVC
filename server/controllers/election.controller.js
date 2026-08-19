const Election = require('../models/Election');
exports.create = async (req, res) => res.json(await Election.create({ post: req.body.post, candidateIds: req.body.candidateIds, tally: Object.fromEntries(req.body.candidateIds.map((c) => [c, 0])) }));
exports.goLive = async (req, res) => {
  const e = await Election.findByIdAndUpdate(req.params.id, { status: 'live' }, { new: true });
  req.app.get('io').emit('election_live', { post: e.post });
  res.json(e);
};
exports.vote = async (req, res) => {
  const uid = req.user._id.toString();
  const upd = await Election.updateOne(
    { _id: req.params.id, status: 'live', votedIds: { $ne: uid }, candidateIds: req.body.candidateId },
    [{ $set: { [`tally.${req.body.candidateId}`]: { $add: [{ $ifNull: [`$tally.${req.body.candidateId}`, 0] }, 1] } } }, { $push: { votedIds: uid } }]
  );
  if (upd.modifiedCount === 0) return res.status(409).json({ msg: 'Vote rejected (duplicate/closed/invalid candidate)' });
  const e = await Election.findById(req.params.id);
  req.app.get('io').emit('vote_update', { id: e._id, tally: Object.fromEntries(e.tally) }); // live results, no voter linkage
  res.json({ msg: 'Vote cast — stored anonymously' });
};
exports.close = async (req, res) => { const e = await Election.findByIdAndUpdate(req.params.id, { status: 'closed', resultsPublished: true }, { new: true }); res.json(e); };
exports.list = async (req, res) => res.json(await Election.find());