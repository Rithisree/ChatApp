const express = require('express')
const messageRoute = express.Router()
const messageController = require('../controllers/messageController')
const middle = require('../middleware/middleware')

messageRoute.post("/sendmessage", middle, messageController.createMessage)
messageRoute.post("/listmessage", middle, messageController.listMsg)


module.exports = messageRoute