const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    about:{
        type: String,
        required: true,
        default: "Hey There!"
    },
    img:{
        type: String,
        required: false,
    },
    verifyStatus:{
        type: String,
        required: false
    },
    lastSeen:{
        type: String,
        required: false
    },
    addContacts:[{
        type:mongoose.Types.ObjectId,
        ref:"user",
        required:false
    }],
    status:{
        type: Number,
        default: 1
    }
}, { timestamps: true })

module.exports = mongoose.model("user", userSchema)