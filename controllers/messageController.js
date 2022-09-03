const mongoose = require('mongoose')
const message = require('../models/message')
const user = require('../models/user')
const userMessageInfo = require('../models/userMessageInfo')

const createMessage = async(req,res) => {
    try {
        const {userId} = req.user
        const {receiverId, msg} = req.body
        const getUser = await user.findById(userId)
        let alreadyUser = false

        for(let i=0;i<=getUser.addContacts.length;i++){
            if(getUser.addContacts.length>0){

                if(mongoose.Types.ObjectId(receiverId).equals(getUser.addContacts[i])){
                    alreadyUser = true
                }
            }            
        }
        if(alreadyUser == false){
            await user.findByIdAndUpdate(userId, {
                $push:{
                    addContacts:receiverId
                }
            })
        }
        
        const getReceiver = await user.findById(receiverId)
        for(let i=0;i<=getReceiver.addContacts.length;i++){
            if(getReceiver.addContacts.length>0){
                if(mongoose.Types.ObjectId(receiverId).equals(getReceiver.addContacts[i])){
                    alreadyUser = true
                }
            }            
        }
        if(alreadyUser == false){
            await user.findByIdAndUpdate(receiverId, {
                $push:{
                    addContacts:userId
                }
            })
        }
        const getMessage = await message.find({senderId:userId, receiverId:receiverId})
        const getMessageViceVersa = await message.find({senderId:receiverId, receiverId: userId})
      
        const newMessageInfo = new userMessageInfo({
            userId:userId,
            receiverId:receiverId,
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

        const getMessages = await message.find({senderId:userId, receiverId:receiverId}).populate({path:"messages", model:"userMessageInfo", select:{_id:1, message:1, createdAt:1, userId:1, readStatus:1, receiverId:1}}).populate({path:"receiverId", model:"user", select:{_id:1, name:1, img:1}})

        await userMessageInfo.updateMany({userId:receiverId, receiverId:userId},{
            $set:{
                readStatus:true
            }
        })

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
    try {
        const {userId}= req.user
        const {receiverId} = req.body
        const getMessagesViceVersa = await message.find({receiverId:userId, senderId:receiverId}).populate({path:"messages", model:"userMessageInfo", select:{_id:1, message:1, createdAt:1, userId:1}}).populate({path:"receiverId", model:"user", select:{_id:1, name:1, img:1}})
      
        if(getMessagesViceVersa.length>0){
          
            const getMessagePromise = getMessagesViceVersa[0].messages.map(async(ele) => {
               
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
    } catch (error) {
        return res.status(400).json({
            "status":false,
            "message":error
            
        })
    }
}

const lastMsg = async(req,res) => {
    try {
        const {userId} = req.user
        const getUser = await user.findById(userId).select({_id:1, name:1, addContacts:1})
        const getMessages = await message.find({status:1, senderId:userId}).populate({path:"messages", model:"userMessageInfo"})
        console.log(getMessages)
        let lastMsg = []
        let getLastMsg = []
       
        if(getUser.addContacts.length > 0){
            if(getMessages.length >0){
                const userPromise = getUser.addContacts.map(async(element) => {
                    
                        for(let i=0; i<getMessages.length; i++){
                        if((element._id).equals(getMessages[i].senderId)){
                            
                            const filteredMessages = getMessages[i].messages
                            
                            const length = filteredMessages.length
                            if(length>0){
                                await userMessageInfo.findByIdAndUpdate(getMessages[i].messages[length-1]._id,{
                                    $set:{
                                        lastMsgSentBy:element._id
                                    }
                                })
                            }
                            
                            lastMsg.push(filteredMessages[length-1])
                            break
                        }
                        
                        else{

                            if((element._id).equals(getMessages[i].receiverId)){
                                console.log("elseif")
                                const filteredMessages = getMessages[i].messages
                                const length = filteredMessages.length
                                if(length>0){
                                    await userMessageInfo.findByIdAndUpdate(getMessages[i].messages[length-1]._id,{
                                        $set:{
                                            lastMsgSentBy:element._id
                                        }
                                    })
                                }
                                lastMsg.push(filteredMessages[length-1])
                                break
                            }
                        }
                    }
                    
                })
                await Promise.all(userPromise)
            }
        }

        const getLastMsgPromise = lastMsg.map(async(msg) => {
            const getLastMsgDet = await userMessageInfo.findById(msg).select({_id:1, message:1, readStatus:1, userId:1, receiverId:1, lastMsgSentBy:1, createdAt:1, readStatus:1})
            getLastMsg.push(getLastMsgDet)
        })
        await Promise.all(getLastMsgPromise)
        return res.status(200).json({
            "status":true,
            "data": getLastMsg
        })
    } catch (error) {
        return res.status(400).json({
            "status":false,
            "message":error
            
        })
    }
}


module.exports = {createMessage, listMsg, deleteMessage, doubleTick, lastMsg}