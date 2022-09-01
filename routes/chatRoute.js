const express = require('express')
const chatRoute = express.Router()
const chatController = require('../controllers/chatController')
const middle = require('../middleware/middleware')

chatRoute.get("/listuser", middle, chatController.listUser)
chatRoute.get("/listuserdetails", middle, chatController.listUserDetails)
chatRoute.post("/listreceiverdetails", middle, chatController.listReceiverDetails)
chatRoute.post("/updateuseravathar", middle, chatController.updateUserAvathar)
chatRoute.post("/listuserbasedonid", middle, chatController.listUserBasedOnId)
chatRoute.post("/updateuserdetails", middle, chatController.updateUserDetails)
chatRoute.post("/updatelastseen", middle, chatController.updateLastSeen)

module.exports = chatRoute