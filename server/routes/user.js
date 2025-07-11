const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ✅ GET /api/user/:username — Get public profile
router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .select('-password')
            .lean();

        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Defensive defaults
        const stats = user.stats || {};

        // ✅ Add totalBattles
        user.totalBattles = (stats.wins || 0) + (stats.losses || 0);

        // ✅ Add friend count (new logic)
        user.friendCount = (user.friends || []).length;

        // ✅ Add Rank badge
        const rating = stats.skillRating || 0;
        if (rating >= 1800) user.rank = 'Platinum';
        else if (rating >= 1400) user.rank = 'Gold';
        else if (rating >= 1000) user.rank = 'Silver';
        else user.rank = 'Bronze';

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// ✅ PUT /api/user/edit — only owner can edit
router.put('/edit', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { username, profilePic } = req.body;

        // ✅ Allow renaming only if not taken
        const existing = await User.findOne({ username });
        if (existing && existing._id.toString() !== decoded.id) {
            return res.status(400).json({ msg: 'Username already taken' });
        }

        const user = await User.findById(decoded.id);
        user.username = username || user.username;
        user.profilePic = profilePic || user.profilePic;
        await user.save();

        res.json({ msg: 'Profile updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Update failed' });
    }
});

module.exports = router;
