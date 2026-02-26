// models/ChatHistory.js
const mongoose = require('mongoose');

// Define the blueprint for our chat data
const chatHistorySchema = new mongoose.Schema({
    videoId: {
        type: String,
        required: true,
        trim: true // Automatically removes accidental spaces at the beginning or end
    },
    question: {
        type: String,
        required: true,
        trim: true
    },
    answer: {
        type: String,
        required: true
    }
}, 
// This automatically adds 'createdAt' and 'updatedAt' fields to the database entry
{ timestamps: true });

// Export the model so our controller can use it to create and save documents
module.exports = mongoose.model('ChatHistory', chatHistorySchema);