const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const connectDB = require('./db');
require('dotenv').config();

const app = express();
connectDB();

// ✅ Middleware FIRST
app.use(cors());
app.use(express.json());

// ✅ Routes AFTER middleware
app.use('/api', authRoutes);

app.get('/', (req, res) => {
    res.send('SkillFighter API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
