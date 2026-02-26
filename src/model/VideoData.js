const mongoose = require('mongoose');

const videoDataSchema = new mongoose.Schema({
    videoId: {
        type: String,
        required: true,
        unique: true // Prevents saving the same video twice
    },
    comments: {
        type: [String], // An array of text strings
        required: true
    },
    analyzedAt: {
        type: Date,
        default: Date.now
    }
});

const VideoData = mongoose.model('VideoData', videoDataSchema);
module.exports = VideoData;