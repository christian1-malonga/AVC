const multer = require('multer');
const mongoose = require('mongoose');
const { Song, DocumentMeta } = require('../models/core');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
const bucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });

exports.uploadSong = [upload.single('file'), async (req, res) => {
  const id = new mongoose.Types.ObjectId();
  await bucket().openUploadStreamWithId(id, req.file.originalname).end(req.file.buffer);
  const song = await Song.create({ title: req.body.title, part: req.body.part, format: req.body.format, size: (req.file.size / 1e6).toFixed(1) + ' MB', tag: req.body.tag, gridFsId: id, by: req.user.name, roleAtTime: req.body.roleAtTime, date: new Date().toISOString().slice(0, 10) });
  res.json(song);
}];
exports.uploadDocument = [upload.single('file'), async (req, res) => {
  const id = new mongoose.Types.ObjectId();
  await bucket().openUploadStreamWithId(id, req.file.originalname).end(req.file.buffer);
  const doc = await DocumentMeta.create({ title: req.body.title, category: req.body.category, version: req.body.version, desc: req.body.desc, gridFsId: id, size: (req.file.size / 1e6).toFixed(1) + ' MB', by: req.user.name, roleAtTime: req.body.roleAtTime, date: new Date().toISOString().slice(0, 10) });
  res.json(doc);
}];
exports.download = async (req, res) => {
  const meta = await DocumentMeta.findById(req.params.id).catch(() => Song.findById(req.params.id));
  if (!meta) return res.status(404).json({ msg: 'File not found' });
  bucket().openDownloadStream(new mongoose.Types.ObjectId(meta.gridFsId)).pipe(res);
};