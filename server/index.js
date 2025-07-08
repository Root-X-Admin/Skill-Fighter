// server/index.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');


require('dotenv').config();

const app = express();
const connectDB = require('./db');
connectDB();
app.use('/api', authRoutes);
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
    res.send('SkillFighter API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
