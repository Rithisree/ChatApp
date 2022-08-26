const message = require('../models/message')
const userMessageInfo = require('../models/userMessageInfo')

const createMessage = async(req,res) => {
    try {
        const {userId} = req.user
        const {receiverId, msg} = req.body

        const getMessage = await message.find({senderId:userId, receiverId:receiverId})
        const getMessageViceVersa = await message.find({senderId:receiverId, receiverId: userId})
      
        const newMessageInfo = new userMessageInfo({
            userId:userId,
            message:msg
        })
        await newMessageInfo.save();

        if(getMessage.length == 0){
            const newMessage = new message({
                senderId: userId,
                receiverId,
                messages: newMessageInfo._id
            })
            await newMessage.save()
        }else{
            await message.findOneAndUpdate({senderId:userId, receiverId:receiverId},{
                $push:{
                    messages: newMessageInfo._id
                }
            })

            if(getMessageViceVersa == 0){
                const newMessage = new message({
                    senderId: receiverId,
                    receiverId: userId,
                    messages: newMessageInfo._id
                })
                await newMessage.save()
            }else{
                await message.findOneAndUpdate({senderId:receiverId, receiverId: userId},{
                    $push:{
                        messages: newMessageInfo._id
                    }
                })
            }
        }

    
        return res.status(200).json({
            "status":true,
            "data":"Message Sent!"
        })
    } catch (error) {
        return res.status(400).json({
            "status":false,
            "Message":"Cannot Send"
        })
    }
}

const listMsg = async(req,res) => {
    try {
        const {userId} = req.user
        const {receiverId} = req.body

        const getMessages = await message.find({senderId:userId, receiverId:receiverId}).populate({path:"messages", model:"userMessageInfo", select:{_id:1, message:1, createdAt:1, userId:1}}).populate({path:"receiverId", model:"user", select:{_id:1, name:1, img:1}})
        
        return res.status(200).json({
            "status":true,
            "data":getMessages,
            "userId":userId
        })
    } catch (error) {
        return res.status(400).json({
            "status":false,
            "message":"Not found"
        })
    }
}


module.exports = {createMessage, listMsg}