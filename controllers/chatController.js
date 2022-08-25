const user = require('../models/user')
const testing = async(req,res) => {
    console.log("Hello, I'm testing Middleware")

    return res.status(200).json({
        "status":true,
        "data":"Middleware Done"
    })
}

const listUser = async(req,res) => {
    
    try{
        const {userId} = req.user
        const getUser = await user.find({_id:{$ne:userId}, status:1})
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

module.exports = {testing, listUser, listUserDetails}