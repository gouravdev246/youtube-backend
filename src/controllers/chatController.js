const ChatSession = require('../model/ChatSession.model');
const User = require('../model/user.model');
const VideoSummary = require('../model/VideoSummary');
const { fetchYouTubeComments } = require('../services/youtubeService');
const { filterComments } = require('../services/filterService');
const { generateMasterSummary, answerFromSummary } = require('../services/aiService');

// POST /api/chat/create
// Creates a new empty chat session for a video, returns the chatId
const createChatSession = async (req, res) => {
    try {
        const { videoId } = req.body;
        const userId = req.user._id;

        if (!videoId) {
            return res.status(400).json({ error: 'videoId is required.' });
        }

        // Check and decrement usage limit
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        if (user.usageLimit <= 0) {
            return res.status(403).json({
                error: 'Usage limit reached.',
                message: 'You have used your 4 free credits. Please contact support to upgrade.'
            });
        }

        const newSession = await ChatSession.create({
            userId,
            videoId,
            title: `Chat about ${videoId}`,
            messages: []
        });

        // Decrement limit after successful creation
        user.usageLimit -= 1;
        await user.save();

        return res.status(201).json({
            chatId: newSession._id,
            videoId: newSession.videoId,
            title: newSession.title,
            usageLimit: user.usageLimit
        });

    } catch (error) {
        console.error('createChatSession Error:', error.message);
        return res.status(500).json({ error: 'Failed to create chat session.' });
    }
};

// GET /api/chat/:chatId
// Fetches the full chat session (messages + videoId) by chatId
const getChatSession = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        const session = await ChatSession.findOne({ _id: chatId, userId });

        if (!session) {
            return res.status(404).json({ error: 'Chat session not found.' });
        }

        return res.status(200).json(session);

    } catch (error) {
        console.error('getChatSession Error:', error.message);
        return res.status(500).json({ error: 'Failed to fetch chat session.' });
    }
};

// GET /api/chat
// Lists all chat sessions for the logged-in user (sidebar history)
const listChatSessions = async (req, res) => {
    try {
        const userId = req.user._id;

        const sessions = await ChatSession.find({ userId })
            .select('_id title videoId createdAt')  // Only send what's needed for sidebar
            .sort({ createdAt: -1 });               // Newest first

        return res.status(200).json(sessions);

    } catch (error) {
        console.error('listChatSessions Error:', error.message);
        return res.status(500).json({ error: 'Failed to list chat sessions.' });
    }
};

// POST /api/chat/:chatId/message
// Streams AI answer back to the client using Server-Sent Events
const addMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { userQuestion } = req.body;
        const userId = req.user._id;

        if (!userQuestion) {
            return res.status(400).json({ error: 'userQuestion is required.' });
        }

        const session = await ChatSession.findOne({ _id: chatId, userId });
        if (!session) {
            return res.status(404).json({ error: 'Chat session not found.' });
        }

        // Get or generate the master summary for this video
        let videoRecord = await VideoSummary.findOne({ videoId: session.videoId });
        if (videoRecord) {
            console.log('Using cached Master Summary from DB...');
        } else {
            console.log(`Generating master summary for video: ${session.videoId}...`);
            const rawComments = await fetchYouTubeComments(session.videoId);
            const cleanComments = filterComments(rawComments);
            const newSummary = await generateMasterSummary(cleanComments);
            videoRecord = await VideoSummary.create({ videoId: session.videoId, masterSummary: newSummary });
        }

        // Set SSE headers so frontend can read the stream
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Get the AI stream
        const stream = await answerFromSummary(videoRecord.masterSummary, userQuestion);

        // Collect full answer while streaming chunks to client
        let fullAnswer = '';
        for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content || '';
            if (token) {
                fullAnswer += token;
                res.write(`data: ${JSON.stringify({ token })}\n\n`);
            }
        }

        // Signal stream is done
        res.write(`data: [DONE]\n\n`);
        res.end();

        // Save both messages to the session in the background
        ChatSession.findByIdAndUpdate(chatId, {
            $push: {
                messages: {
                    $each: [
                        { role: 'user', content: userQuestion },
                        { role: 'assistant', content: fullAnswer }
                    ]
                }
            }
        }).catch(err => console.error("DB save error:", err.message));

        // Update title from the first question
        if (session.messages.length === 0) {
            ChatSession.findByIdAndUpdate(chatId, {
                title: userQuestion.slice(0, 60)
            }).catch(() => { });
        }

    } catch (error) {
        console.error('addMessage Error:', error.message);
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Failed to process message.' });
        }
    }
};

// DELETE /api/chat/:chatId
// Deletes a chat session owned by the current user
const deleteChatSession = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        const deleted = await ChatSession.findOneAndDelete({ _id: chatId, userId });
        if (!deleted) {
            return res.status(404).json({ error: 'Chat session not found.' });
        }

        return res.status(200).json({ message: 'Chat deleted.' });
    } catch (error) {
        console.error('deleteChatSession Error:', error.message);
        return res.status(500).json({ error: 'Failed to delete chat session.' });
    }
};

module.exports = { createChatSession, getChatSession, listChatSessions, addMessage, deleteChatSession };
