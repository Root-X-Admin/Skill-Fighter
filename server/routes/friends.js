const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticate = require('../middleware/auth');

// 📩 Send Friend Request
router.post('/request/:toUsername', authenticate, async (req, res) => {
    const fromUser = await User.findById(req.user.id);
    const toUser = await User.findOne({ username: req.params.toUsername });

    if (!toUser) return res.status(404).json({ msg: 'User not found' });
    if (fromUser._id.equals(toUser._id)) return res.status(400).json({ msg: 'You cannot friend yourself' });

    if (toUser.friends.includes(fromUser._id)) return res.status(400).json({ msg: 'Already friends' });
    if (toUser.friendRequests.includes(fromUser._id)) return res.status(400).json({ msg: 'Request already sent' });

    toUser.friendRequests.push(fromUser._id);
    await toUser.save();

    return res.json({ msg: 'Friend request sent' });
});

// ✅ Accept Friend Request
router.post('/accept/:fromUserId', authenticate, async (req, res) => {
    const currentUser = await User.findById(req.user.id);
    const fromUser = await User.findById(req.params.fromUserId);

    if (!fromUser) return res.status(404).json({ msg: 'Sender not found' });

    if (!currentUser.friendRequests.includes(fromUser._id)) {
        return res.status(400).json({ msg: 'No friend request from this user' });
    }

    currentUser.friends.push(fromUser._id);
    fromUser.friends.push(currentUser._id);

    currentUser.friendRequests.pull(fromUser._id);

    await currentUser.save();
    await fromUser.save();

    return res.json({ msg: 'Friend request accepted' });
});

// ❌ Remove friend
router.post('/remove/:friendId', authenticate, async (req, res) => {
    const currentUser = await User.findById(req.user.id);
    const friend = await User.findById(req.params.friendId);

    if (!friend) return res.status(404).json({ msg: 'Friend not found' });

    currentUser.friends.pull(friend._id);
    friend.friends.pull(currentUser._id);

    await currentUser.save();
    await friend.save();

    return res.json({ msg: 'Friend removed' });
});

// 👀 Check friendship status
router.get('/status/:fromId/:toId', async (req, res) => {
    const fromUser = await User.findById(req.params.fromId);
    const toUser = await User.findById(req.params.toId);

    if (!fromUser || !toUser) return res.status(404).json({ msg: 'User(s) not found' });

    const isFriend = fromUser.friends.includes(toUser._id);
    const requestSent = toUser.friendRequests.includes(fromUser._id);

    return res.json({ isFriend, requestSent });
});

// 🔍 NEW: Get list of incoming friend requests
router.get('/requests/incoming', authenticate, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id).populate('friendRequests', 'username profilePic');
        res.json({ requests: currentUser.friendRequests });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Failed to fetch requests' });
    }
});

// 🧑‍🤝‍🧑 NEW: Get list of current friends
router.get('/list', authenticate, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id).populate('friends', 'username profilePic');
        res.json({ friends: currentUser.friends });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Failed to fetch friends' });
    }
});

// 📨 Get list of sent friend requests
router.get('/sent/:userId', authenticate, async (req, res) => {
    try {
        const users = await User.find({ friendRequests: req.params.userId }).select('username profilePic');
        res.json({ sent: users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Failed to get sent requests' });
    }
});

module.exports = router;
