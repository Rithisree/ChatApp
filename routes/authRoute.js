const express = require('express')
const authRoute = express.Router()
const authController = require('../controllers/authController')

authRoute.post("/googlesignin", authController.googleSignIn)
authRoute.post("/register", authController.register)
authRoute.post("/activate", authController.activate)
authRoute.post("/login", authController.login)
authRoute.post("/resendmail", authController.resendMail)
authRoute.post("/forgetpassword", authController.forgetPassword)
authRoute.post("/resetpassword", authController.resetPassword)

module.exports = authRoute