const express = require('express')
const router = express.Router()
const {processVideoAndChat} = require('../controllers/analyzeController')
router.post('/comments' , processVideoAndChat)

module.exports = router