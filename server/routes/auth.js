const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const nodemailer = require('nodemailer');
require('dotenv').config(); // ✅ Auto-loads from ./server/.env if file is in same folder


// 🔒 ENV required: JWT_SECRET, EMAIL_USER, EMAIL_PASS

// ✅ Utility: Send Email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


// ✅ Register Route
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ msg: 'Email already exists' });

        const hashed = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashed });
        await user.save();

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET
        );

        res.json({ token, user: { id: user._id, username: user.username } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// ✅ Login with email or username
router.post('/login', async (req, res) => {
    const { identifier, password } = req.body;
    try {
        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }],
        });
        if (!user) return res.status(400).json({ msg: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET
        );

        res.json({ token, user: { id: user._id, username: user.username } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// ✅ Send OTP
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'User not found' });

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        await Otp.create({ email, otp: otpCode });

        await transporter.sendMail({
            from: `"SkillFighter" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your OTP for SkillFighter",
            html: `<p>Your OTP is <strong>${otpCode}</strong>. It expires in 10 minutes.</p>`,
        });

        res.json({ msg: 'OTP sent to email' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Failed to send OTP' });
    }
});

router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const record = await Otp.findOne({
            email,
            otp,
            createdAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) } // expires after 10 mins
        });

        if (!record) return res.status(400).json({ msg: 'Invalid or expired OTP' });

        res.json({ msg: 'OTP verified' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'OTP verification error' });
    }
});


// ✅ Reset Password
router.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'User not found' });

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        await user.save();

        // Remove OTPs after reset
        await Otp.deleteMany({ email });

        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Password reset failed' });
    }
});

module.exports = router;
