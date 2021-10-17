const modelUser = require("../model/user")
const crypto = require("crypto")
const mailer = require("../module/mailer")
const path = require("path")

async function sendEmail(req, res) {

    const { email } = req.body

    try {

        const user = await modelUser.findOne({ email: email })
        console.log(user);

    if(!user){

        return res.status(400).json({ status:"User not find!" })
    }

        const token = crypto.randomBytes(20).toString("hex")

        const now = new Date()
        now.setHours(now.getHours()+1)

        await modelUser.findByIdAndUpdate(user._id, {
            "$set": {
                "passwordResetToken": token,
                "passwordResetExpires": now
            }
        })

        console.log(token, now);

        console.log(path.resolve());

        mailer.sendMail({
            to: email,
            from: "andersonjulio15@gmail.com",
            template: "auth/forgot_Password",
            subject:"Alteração de senha - Kipiai",
            context: { token }
        }, (err,res) => {
            if (err){
                console.log(err)
            }
        })

        return res.status(200).json({ status:"E-mail has sended!" })
            

    } catch (error) { 
        console.log(error)
        console.log("Error on forgot email!");
    }
    
}

module.exports = { sendEmail }