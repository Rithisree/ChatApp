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
            })
            await newMessage.save()

            await message.findByIdAndUpdate(newMessage._id,{
                $push:{
                    messages: newMessageInfo._id
                }
            })
        }else{
            await message.findOneAndUpdate({senderId:userId, receiverId:receiverId},{
                $push:{
                    messages: newMessageInfo._id
                }
            })
        }

        if(getMessageViceVersa == 0){
            const newMessage = new message({
                senderId: receiverId,
                receiverId: userId,
            })
            await newMessage.save()

            await message.findByIdAndUpdate(newMessage._id,{
                $push:{
                    messages: newMessageInfo._id
                }
            })
        }else{
            await message.findOneAndUpdate({senderId:receiverId, receiverId: userId},{
                $push:{
                    messages: newMessageInfo._id
                }
            })
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

        const getMessages = await message.find({senderId:userId, receiverId:receiverId}).populate({path:"messages", model:"userMessageInfo", select:{_id:1, message:1, createdAt:1, userId:1, readStatus:1}}).populate({path:"receiverId", model:"user", select:{_id:1, name:1, img:1}})

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

const deleteMessage = async(req,res) => {
    try {
        const {userId} = req.user
        const {receiverId} = req.body
        
        await message.findOneAndUpdate({senderId:userId, receiverId:receiverId},{
            $set:{
                messages:[]
            }
        })
        const getUser = await message.find({senderId:userId, receiverId:receiverId})
        console.log(getUser)
        return res.status(200).json({
            "status":true,
            "data":"Deleted Successfully"
        })
    } catch (error) {
        return res.status(400).json({
            "status":false,
            "message":error
            
        })
    }
}

const doubleTick = async(req, res) => {
    // try {
        const {userId}= req.user
        const {receiverId} = req.body
        const getMessagesViceVersa = await message.find({receiverId:userId, senderId:receiverId}).populate({path:"messages", model:"userMessageInfo", select:{_id:1, message:1, createdAt:1, userId:1}}).populate({path:"receiverId", model:"user", select:{_id:1, name:1, img:1}})
        console.log(getMessagesViceVersa)
        if(getMessagesViceVersa.length>0){
            console.log("hi")
            const getMessagePromise = getMessagesViceVersa[0].messages.map(async(ele) => {
                console.log("id",ele._id)
                await userMessageInfo.findByIdAndUpdate(ele._id, {
                    $set:{
                        readStatus:true
                    }
                })
            })
            
            await Promise.all(getMessagePromise)

        }
        
        
        return res.status(200).json({
            "status":true
        })
    // } catch (error) {
    //     return res.status(400).json({
    //         "status":false,
    //         "message":error
            
    //     })
    // }
}


module.exports = {createMessage, listMsg, deleteMessage, doubleTick}