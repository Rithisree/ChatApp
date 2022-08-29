const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const authRoute = require('./routes/authRoute')
const chatRoute = require('./routes/chatRoute')
const messageRoute = require('./routes/messageRoute')

const app = express()
const socket = require("socket.io")

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200
}

require('dotenv/config')
app.use(bodyParser.json({ urlencoded: true }))
app.use("/auth", cors(corsOptions), authRoute)
app.use("/dashboard", cors(corsOptions), chatRoute)
app.use("/message", cors(corsOptions), messageRoute)

const server = app.listen(process.env.PORT, (err) => {
    if(!err){
        console.log("Server Started")
    }
})

mongoose.connect(process.env.MONGODB, (err) => {
    if(!err){
        console.log("Database Connected")
    }
    else
        console.log(err)
})

const io = socket(server, {
    cors:{
        origin:"*"
    }
})

global.onlineUsers = new Map()
global.offlineUsers = new Map()
const online = []

io.on("connection", (socket) => {
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id)
        online.push({"userId":userId, "socketId": socket.id})
        console.log(onlineUsers)
    })
    socket.on("get-online", (data) => {
        const getUser = onlineUsers.get(data)
        console.log(getUser)
        if(getUser !== undefined){
            socket.emit("online-user", {status:true})
        }else{
        
            const sendUserSocket = offlineUsers.get(data)
            console.log("offlien",sendUserSocket)
            if(sendUserSocket !== undefined){
                console.log("HI")
                socket.to(sendUserSocket).emit("online-user", {status:false, lastSeen:"10:34"})
            }
            else{
                console.log("else")
                socket.emit("online-user", {status:false})
            }
        }
    })
    socket.on("remove-user", (data) => {
        // const sendUserSocket = onlineUsers.get(data)
        
        // if(sendUserSocket !== undefined){
        //     socket.to(sendUserSocket).emit("online-user", {status:"false", lastSeen:"10:34"})
        // }
        onlineUsers.delete(data)
        offlineUsers.set(data, socket.id)
    })
    
    socket.on("send-msg", (data) => {
        console.log(data)
        const sendUserSocket = onlineUsers.get(data.receiverId)
        
        if(sendUserSocket !== undefined){
            socket.to(sendUserSocket).emit("send", data.msg)
        }
    })
})

