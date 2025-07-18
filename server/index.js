require('dotenv').config(); // ✅ Load .env from same folder

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const friendRoutes = require('./routes/friends');
const runRoute = require('./routes/run');
const connectDB = require('./db');

const app = express();
const server = http.createServer(app);

// ⚡ Initialize Socket.io
const io = new Server(server, {
    cors: { origin: '*' }
});

// 🧠 Plug in Socket-based Arena battle logic
require('./socket/arena')(io);
require('./socket/coding')(io); // 👈 Added Coding Battle socket logic

// 🧬 DB connection
connectDB();

// 🧰 Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// 🛣️ Routes
app.use('/api', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/run', runRoute);

// 🏁 Root Route
app.get('/', (req, res) => {
    res.send('SkillFighter API is running');
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
