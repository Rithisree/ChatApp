const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const authRoute = require('./routes/authRoute')
const chatRoute = require('./routes/chatRoute')

const app = express()
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200
}

require('dotenv/config')
app.use(bodyParser.json({ urlencoded: true }))
app.use("/auth", cors(corsOptions), authRoute)
app.use("/dashboard", cors(corsOptions), chatRoute)
app.get("/hi", async (req, res) => {
    res.write("hi")
    res.send("he")
})

app.listen(process.env.PORT, (err) => {
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