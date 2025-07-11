require('dotenv').config(); // ✅ Load .env from same folder

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const connectDB = require('./db');
const userRoutes = require('./routes/user');
const friendRoutes = require('./routes/friends');

const app = express();
connectDB();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));


app.use('/api', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/friends', friendRoutes);


app.get('/', (req, res) => {
    res.send('SkillFighter API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
