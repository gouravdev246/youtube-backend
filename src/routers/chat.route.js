const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const {
    createChatSession,
    getChatSession,
    listChatSessions,
    addMessage,
    deleteChatSession
} = require('../controllers/chatController');

// All chat routes require the user to be logged in
router.use(verifyToken);

router.post('/create', createChatSession);       // Create a new session
router.get('/', listChatSessions);               // Get all sessions (sidebar)
router.get('/:chatId', getChatSession);          // Get one session by ID
router.post('/:chatId/message', addMessage);     // Add a message to a session
router.delete('/:chatId', deleteChatSession);    // Delete a session

module.exports = router;
