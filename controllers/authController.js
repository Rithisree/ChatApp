const user = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')

const verifyFile = fs.readFileSync(path.resolve(__dirname, "../views/verify.hbs"), 'utf8')
const verifyTemplate = handlebars.compile(verifyFile)

const resetPasswordFile = fs.readFileSync(path.resolve(__dirname, "../views/resetpass.hbs"), 'utf8')
const resetTemplate = handlebars.compile(resetPasswordFile)

const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.G00GLECLIENTID)

let transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

const register = async(req,res) => {
    try {
        const { name, email, password } = req.body

        const getUser = await user.findOne({ email:email })
        if(getUser){
            return res.status(400).json({
                "status": false,
                "message": "User Already Exists"
            })
        }

        const encryptPassword = await bcrypt.hash(password, 10)

        const newUser = new user ({
            name,
            email,
            password: encryptPassword.toString(),
            verifyStatus: "pending"
        })

        await newUser.save()

        const token = jwt.sign({ id: newUser._id, email: newUser.email, name: newUser.name }, process.env.TOKENID, {expiresIn:"5m"})

        let message = {
            from: '"ADMIN TEAM" <admin@gmail.com>',
            to: newUser.email,
            subject: "User Account Verification",
            html: verifyTemplate({
                url: process.env.FRONTENDURL,
                token:token
            })
        }

        transport.sendMail(message, (err) => {
            if(err){
                console.log(err)
            }
            else{
                console.log("Mail Sent!")
            }
        })


        return res.status(200).json({
            "status": true,
            "data": "User Created Successfully"
        })

        
    } catch (error) {
        return res.status(400).json({
            "status": false,
            "message": error
        })
    }
}

const activate = async(req,res) => {
    try {
        const {token} = req.body
    
        const getToken = await getDecoded(token)
        if(getToken == "error"){
            return res.status(400).json({
                "status":false,
                "message":"Token Expired!"
            })
        }

        const {id} = getToken
      
        const getUser = await user.findById(id)

        if(getUser){
            if(getUser.verifyStatus == "success"){
                return res.status(400).json({
                    "status":true,
                    "data":"User Already Verified"
                })
            }
            await user.findByIdAndUpdate(id,{
                $set:{
                    verifyStatus:"success"
                }
            })

            return res.status(200).json({
                "status":true,
                "data":"User Verified Successfully"
            })
        }
        else{
            return res.status(400).json({
                "status":false,
                "message":"No User Found"
            })
        }
    } catch (error) {
        return res.status(400).json({
            "status":false,
            "message":error
        })
    }
   
}

const getDecoded = (token) => {
    return new Promise((resolve) => {
        jwt.verify(token, process.env.TOKENID, async(err, decoded)=>{
            if(!err){
                resolve(decoded)
            }
            else{
                resolve("error")
            }
        })
    })
}

const getDecodedReset = (token) => {
    return new Promise((resolve) => {
        jwt.verify(token, process.env.RESETTOKENID, async(err, decoded)=>{
            if(!err){
                resolve(decoded)
            }
            else{
                resolve("error")
            }
        })
    })
}

const login = async(req,res) => {
    try {
        const { email, password } = req.body
        const getUser = await user.findOne({email:email})

        if(getUser){
            if(getUser.verifyStatus == "success"){
                const passwordCheck = await bcrypt.compare(password, getUser.password)
                
                if(passwordCheck){
                    const token = jwt.sign({userId:getUser._id, email:getUser.email, name:getUser.name}, process.env.TOKENID, {expiresIn:"2d"})

                    return res.status(200).json({
                        "status":true,
                        "data":token,
                        "userId":getUser._id
                    })
                }
                else{
                    return res.status(400).json({
                        "status":false,
                        "message":"Incorrect Password"
                    })
                }
            }
            else{
                return res.status(400).json({
                    "status":false,
                    "message":"Account Verification Pending"
                })
            }
        }
        else{
            return res.status(400).json({
                "status":false,
                "message":"User Doesn't Exist"
            })
        }
    } catch (error) {
        return res.status(400).json({
            "status":false,
            "message":error
        })
    }

}

const resendMail = async(req,res) => {
    try {
        const {email} = req.body
        const getUser = await user.findOne({email:email})
        if(getUser){
            const token = jwt.sign({ id: getUser._id, email: getUser.email, name: getUser.name }, process.env.TOKENID, {expiresIn:"5m"})

            let message = {
                from: '"ADMIN TEAM" <admin@gmail.com>',
                to: getUser.email,
                subject: "User Account Verification",
                html: verifyTemplate({
                    url: process.env.FRONTENDURL,
                    token:token
                })
            }

            transport.sendMail(message, (err) => {
                if(err){
                    console.log(err)
                }
                else{
                    console.log("Mail Sent!")
                }
            })

        }
        else{
            return res.status(400).json({
                "status":false,
                "message":"User Not Found"
            })
        }

        return res.status(200).json({
            "status":true,
            "data": "Mail sent"
        })
    } catch (error) {
        return res.status(400).json({
            "status":false,
            "message":error
        })
    }
}

const forgetPassword = async(req,res) => {
    try {
        const {email} = req.body
        const getUser = await user.findOne({email:email})

        if(getUser){
            const token = jwt.sign({id:getUser._id, email: getUser.email, name: getUser.name}, process.env.RESETTOKENID, {expiresIn:"5m"})

            let message = {
                from: '"ADMIN TEAM" <admin@gmail.com>',
                to: getUser.email,
                subject: "Reset Password",
                html: resetTemplate({
                    url: process.env.FRONTENDURL,
                    token:token
                })
            }

            transport.sendMail(message, (err) => {
                if(err){
                    console.log(err)
                }
                else{
                    console.log("Mail Sent!")
                }
            })

            return res.status(200).json({
                "status":true,
                "data":"Mail Sent!"
            })
        }
        else{
            return res.status(400).json({
                "status":false,
                "message":"No user found"
            })
        }
    } catch (error) {
        return res.status(400).json({
            "status":false,
            "message":error
        })
    }
}

const resetPassword = async(req,res) => {
    const {token,password} = req.body

    if(token){
        const decodedToken = await getDecodedReset(token)
        const getDecodedPassword = await bcrypt.hash(password, 10)

        if(decodedToken != "error"){
            const {id} = decodedToken
            await user.findByIdAndUpdate(id,{
                $set:{
                    password:getDecodedPassword.toString()
                }
            })
            return res.status(200).json({
                "status":true,
                "data":"Password updated"
            })
        }
        else{
            return res.status(400).json({
                "status":false,
                "message":"Token Expired!"
            })
        }
    }
    else{
        return res.status(400).json({
            "status":false,
            "message":"Invalid Token"
        })
    }
}


const googleSignIn = async(req,res) => {
    try {
        const {GoogleToken} = req.body
        let token;
        let userId;
        const ticket = await client.verifyIdToken({
            idToken:GoogleToken,
            audience: process.env.G00GLECLIENTID
        });
        const {name, email} = ticket.getPayload();

        const getUser = await user.findOne({email:email})
      
        if(getUser){
            if(getUser.verifyStatus == "pending"){
                await user.findOneAndUpdate({email:email}, {
                    $set:{
                        verifyStatus:"success"
                    }
                })
            }
            userId = getUser._id
            token = jwt.sign({ userId: getUser._id, email: getUser.email, name: getUser.name }, process.env.TOKENID, {expiresIn:"2d"})
        }else{
            const encryptPassword = await bcrypt.hash(Date().now, 10)
            const newUser = new user ({
                name,
                email,
                password: encryptPassword.toString(),
                verifyStatus: "success"
            })
            await newUser.save()
            userId = newUser._id
            token = jwt.sign({ userId: newUser._id, email: newUser.email, name: newUser.name }, process.env.TOKENID, {expiresIn:"2d"})
        }

        return res.status(200).json({
            "status":true,
            "data":token,
            "userId":userId
        })
    } catch (error) {
        return res.status(400).json({
            "status":false,
            "message":"Login Failed!"
        })
    }
}


module.exports = { register, activate, login, resendMail, forgetPassword, resetPassword, googleSignIn }