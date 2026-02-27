const VideoSummary = require('../model/VideoSummary');
const ChatSession = require('../model/ChatSession.model');
const { fetchYouTubeComments } = require('../services/youtubeService');
const { filterComments } = require('../services/filterService');
const { generateMasterSummary, answerFromSummary } = require('../services/aiService');

const processVideoAndChat = async (req, res) => {
    try {
        // We now accept an optional 'chatId' if the user is continuing an old conversation
        const { videoId, userQuestion, chatId } = req.body;
        const userId = req.user.id; // From your JWT auth middleware

        if (!videoId || !userQuestion) {
            return res.status(400).json({ error: "Missing Video ID or Question." });
        }

        // --- 1. THE BRAIN (Level-2 Cache Upgrade) ---
        let videoRecord = await VideoSummary.findOne({ videoId });

        if (videoRecord) {
            console.log("Using cached Master Summary from DB...");
        } else {
            console.log(`Fetching and summarizing new video: ${videoId}...`);
            const rawComments = await fetchYouTubeComments(videoId);
            const cleanComments = filterComments(rawComments);

            // Trigger the heavy 70B model ONCE
            const newSummary = await generateMasterSummary(cleanComments);

            videoRecord = await VideoSummary.create({
                videoId: videoId,
                masterSummary: newSummary
            });
        }

        // --- 2. ASK THE AI ---
        console.log("Analyzing with fast 8B AI model...");
        const aiAnswer = await answerFromSummary(videoRecord.masterSummary, userQuestion);

        // --- 3. SESSION MEMORY MANAGEMENT ---
        let session;
        if (chatId) {
            // If continuing a chat, find it in the DB
            session = await ChatSession.findById(chatId);
        } else {
            // If brand new chat, initialize a new document
            session = new ChatSession({ userId, videoId, messages: [] });
        }

        // Push the new conversation into the JSON array
        session.messages.push({ role: 'user', content: userQuestion });
        session.messages.push({ role: 'ai', content: aiAnswer });

        // --- 4. IMMEDIATE RESPONSE ---
        res.status(200).json({
            chatId: session._id, // Send this back so React can update the URL!
            question: userQuestion,
            answer: aiAnswer
        });

        // --- 5. BACKGROUND SAVE ---
        // Notice we use .save() instead of .create() because we are updating an array
        session.save().catch(err => console.error("Database save error:", err.message));

    } catch (error) {
        console.error("Controller Error:", error.message);
        if (!res.headersSent) {
            res.status(500).json({ error: "Something went wrong analyzing the video." });
        }
    }
};

module.exports = { processVideoAndChat };