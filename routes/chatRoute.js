const express = require('express')
const chatRoute = express.Router()
const chatController = require('../controllers/chatController')
const middle = require('../middleware/middleware')

chatRoute.get("/testing", middle, chatController.testing)

module.exports = chatRoute