const express = require('express');
const auth = require('../middleware/auth');
const Store = require('../models/Store');
const r = express.Router();
r.get('/', auth, async (req, res) => { const rows = await Store.find(); res.json(Object.fromEntries(rows.map((x) => [x.key, x.data]))); });
r.put('/', auth, async (req, res) => { for (const [key, data] of Object.entries(req.body)) await Store.updateOne({ key }, { key, data }, { upsert: true }); res.json({ ok: true }); });
module.exports = r;