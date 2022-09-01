const mongoose = require('mongoose')

const userMessageInfoSchema = mongoose.Schema({
    message:{
        type: String,
        required: true
    },
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"user",
        required:true
    },
    receiverId:{
        type:mongoose.Types.ObjectId,
        ref:"user",
        required:true
    },
    readStatus:{
        type: Boolean,
        default: false
    },
    lastMsgSentBy:{
        type:mongoose.Types.ObjectId,
        ref:"user",
        required:false
    },
    status:{
        type: Number,
        default:1
    }
},{timestamps:true})

module.exports = mongoose.model("userMessageInfo", userMessageInfoSchema)