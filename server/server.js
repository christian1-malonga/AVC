const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL } });
app.set('io', io);
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/api', require('./routes'));
io.on('connection', (s) => console.log('⚡ socket', s.id));

connectDB().then(() => server.listen(process.env.PORT, () => console.log(`🚀 API on :${process.env.PORT}`)));