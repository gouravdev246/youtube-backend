const mongoose = require('mongoose');

const videoSummarySchema = new mongoose.Schema({
    videoId: {
        type: String,
        required: true,
        unique: true // Ensures we only ever have ONE summary per video
    },
    masterSummary: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('VideoSummary', videoSummarySchema);