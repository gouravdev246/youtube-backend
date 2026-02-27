const express = require('express')
const router = express.Router()
const { register, login, getMe, logout } = require('../controllers/authController')
const { verifyToken } = require('../middlewares/auth.middleware')

router.post('/register', register)
router.post('/login', login)
router.get('/me', verifyToken, getMe)
router.post('/logout', logout)

module.exports = router