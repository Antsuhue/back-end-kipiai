const modelUser = require("../model/user")
const crypto = require("crypto")

function sendEmail(req, res) {

    const { email } = req.body

    const user = modelUser.findOne({ email: email })

    if(!user){
        return res.status(400).json({ status:"User not find!" })
    }

    try {
        const user = await


    } catch (error) { 
        console.log("Error on forgot email!");
    }
    
}