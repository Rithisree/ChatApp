const user = require('../models/user')

const listUser = async(req,res) => {
    
    try{
        const {userId} = req.user
        const getUser = await user.find({_id:{$ne:userId}, status:1, verifyStatus:"success"})
        return res.status(200).json({
            "status":true,
            "data":getUser
        })
    }catch(error){
        return res.status(400).json({
            "status":false,
            "message":"No Users Found"
        })
    }
}

const listUserBasedOnId = async(req,res) => {
    
    try{
        const {receiverId} = req.body
        const getUser = await user.find({_id:receiverId, status:1})
        return res.status(200).json({
            "status":true,
            "data":getUser
        })
    }catch(error){
        return res.status(400).json({
            "status":false,
            "message":"No Users Found"
        })
    }
}

const listUserDetails = async(req,res) => {
    try {
        const {userId} = req.user
        const getUser = await user.findById(userId)

        return res.status(200).json({
            "status":true,
            "data":getUser
        })
    } catch (error) {
        return res.status(400).json({
            "status":false,
            "message":error
        })
    }
}

const updateUserAvathar = async(req,res) => {
    try {
        const {userId} = req.user
        const {imageUrl} = req.body 

        const getUser = await user.findByIdAndUpdate(userId,{
            $set:{
                img:imageUrl
            }
        })
        return res.status(200).json({
            "status":true,
            "data":"Image Uploaded"
        })

    } catch (error) {
        return res.status(400).json({
            "status":false,
            "message":error
        })
    }
}

const listReceiverDetails = async(req,res) => {
    try {
        const {receiverId} = req.body
        const getUserDetails = await user.findById({_id:receiverId})

        return res.status(200).json({
            "status":true,
            "data":getUserDetails
        })
    } catch (error) {
        return res.status(400).json({
            "status":false,
            "message":error
        })
    }
}

const updateUserDetails = async(req,res) => {
    try {
        const {name, about} = req.body
        const {userId} = req.user

        await user.findByIdAndUpdate(userId, {
            $set:{
                name:name,
                about:about
            }
        })

        return res.status(200).json({
            "status":true,
            "data":"Updated Successfully"
        })
    } catch (error) {
        return res.status(400).json({
            "status":false,
            "message":error
            
        })
    }

}

const updateLastSeen = async(req,res) => {
    try {
        let currentTime = new Date()
        const { receiverId } = req.body
        const time = currentTime.toLocaleString("en-US", {month:'short', day:'numeric', timeZone:"Asia/Kolkata", hour:"2-digit", minute:"2-digit"})
        await user.findByIdAndUpdate(receiverId,{
            $set:{
                lastSeen:time
            }
        })
       
        return res.status(200).json({
            "status":true,
            "data":"Last Seen Updated"
        })
    } catch (error) {
        return res.status(400).json({
            "status":false,
            "message":error
            
        })
    }
}



module.exports = { listUser, listUserDetails, listReceiverDetails, updateUserAvathar, listUserBasedOnId, updateUserDetails, updateLastSeen}