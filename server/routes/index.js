const express = require('express');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const ac = require('../controllers/auth.controller');
const sc = require('../controllers/state.controller');
const r = express.Router();

r.post('/auth/register', ac.register);
r.post('/auth/login', ac.login);
r.post('/auth/demo', ac.demo);
r.post('/auth/google', ac.google);
r.post('/auth/section', auth, ac.section);
r.get('/auth/me', auth, ac.me);
r.post('/auth/role', auth, rbac('president'), ac.grantRole);
r.post('/auth/approve', auth, rbac('president'), ac.approve);
r.get('/state', auth, sc.get);
r.put('/state', auth, sc.put);
module.exports = r;