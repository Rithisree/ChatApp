const express = require('express')
const chatRoute = express.Router()
const chatController = require('../controllers/chatController')
const middle = require('../middleware/middleware')

chatRoute.get("/testing", middle, chatController.testing)
chatRoute.get("/listuser", middle, chatController.listUser)
chatRoute.get("/listuserdetails", middle, chatController.listUserDetails)
chatRoute.post("/listreceiverdetails", middle, chatController.listReceiverDetails)
chatRoute.post("/updateuseravathar", middle, chatController.updateUserAvathar)

module.exports = chatRoute