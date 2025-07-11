const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ✅ GET /api/user/:username — Get public profile with friendship status
router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .select('-password')
            .lean();

        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Defensive defaults
        const stats = user.stats || {};

        // ✅ Add total battles
        user.totalBattles = (stats.wins || 0) + (stats.losses || 0);

        // ✅ Add friend count
        user.friendCount = (user.friends || []).length;

        // ✅ Add rank badge
        const rating = stats.skillRating || 0;
        if (rating >= 1800) user.rank = 'Platinum';
        else if (rating >= 1400) user.rank = 'Gold';
        else if (rating >= 1000) user.rank = 'Silver';
        else user.rank = 'Bronze';

        // ✅ Add friendship/request status if logged in
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const currentUser = await User.findById(decoded.id);

                const isFriend = currentUser.friends.includes(user._id);
                const requestSent = user.friendRequests.includes(currentUser._id);
                const requestReceived = currentUser.friendRequests.includes(user._id);

                user.relationship = { isFriend, requestSent, requestReceived };
            } catch (err) {
                console.warn('Invalid token for friendship check:', err.message);
            }
        }

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// ✅ PUT /api/user/edit — Only owner can edit
router.put('/edit', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { username, profilePic } = req.body;

        // ✅ Check if username is already taken
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
