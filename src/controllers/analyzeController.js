const { fetchYouTubeComments } = require('../services/youtubeService');
const { filterComments } = require('../services/filterService');
const { analyzeCommentsWithAI } = require('../services/aiService');
const ChatHistory = require('../model/ChatHistory.model');
const VideoData = require('../model/VideoData')

const processVideoAndChat = async (req, res) => {
    try {
        const { videoId, userQuestion } = req.body;

        if (!videoId || !userQuestion) {
            return res.status(400).json({ error: "Missing Video ID or Question." });
        }
        // 1. Level-1 Cache: Check if we already answered this EXACT question for this video
        const cachedChat = await ChatHistory.findOne({ videoId, question: userQuestion });
        if (cachedChat) {
            console.log("Serving from chat history cache...");
            return res.status(200).json({
                question: userQuestion,
                answer: cachedChat.answer,
                cached: true
            });
        }

        let aiAnswer;
        let comments;

        // 2. Level-2 Cache: Check if we already have the video's comments
        const existingVideo = await VideoData.findOne({ videoId });

        if (existingVideo) {
            console.log("Using cached comments from DB...");
            comments = existingVideo.comments;
        } else {
            console.log(`Fetching new comments for video: ${videoId}...`);
            const rawComments = await fetchYouTubeComments(videoId);
            comments = filterComments(rawComments);

            // Save video data for future questions about this same video
            await VideoData.create({ videoId, comments });
        }

        // 3. Ask the AI
        console.log("Analyzing with AI...");
        aiAnswer = await analyzeCommentsWithAI(comments, userQuestion);

        // 4. Send response to user immediately
        res.status(200).json({
            question: userQuestion,
            answer: aiAnswer
        });

        // 5. Save this new interaction to ChatHistory in the background
        ChatHistory.create({
            videoId: videoId,
            question: userQuestion,
            answer: aiAnswer
        }).catch(err => console.error("Database save error:", err.message));

    } catch (error) {
        console.error("Controller Error:", error.message);
        if (!res.headersSent) {
            res.status(500).json({ error: "Something went wrong analyzing the video." });
        }
    }
};

module.exports = { processVideoAndChat };

// module.exports = { processVideoComments };