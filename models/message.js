const mongoose = require('mongoose')
const user = require('./user')
const userMessageInfo = require('./userMessageInfo')

const messageSchema = mongoose.Schema({
    senderId:{
        type:mongoose.Types.ObjectId,
        ref:user,
        required:true
    },
    receiverId:{
        type:mongoose.Types.ObjectId,
        ref:user,
        required:true
    },
    messages:[{
        type:mongoose.Types.ObjectId,
        ref:userMessageInfo,
        required:false
    }],
    status:{
        type:Number,
        default:1
    }
},{timestamps:true})

module.exports = mongoose.model("message", messageSchema)