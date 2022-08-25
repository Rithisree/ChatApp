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
    status:{
        type: Number,
        default:1
    }
},{timestamps:true})

module.exports = mongoose.model("userMessageInfo", userMessageInfoSchema)