const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    stats: {
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        skillRating: { type: Number, default: 1000 },
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
