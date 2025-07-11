const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: '' },

    stats: {
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        skillRating: { type: Number, default: 1000 },
        totalBattles: { type: Number, default: 0 },
    },

    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // incoming requests

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
