const express = require('express')
const router = express.Router()
const {otpGenerat} = require('../controllers/otpController')
router.post('/generate' , otpGenerat)

module.exports = router