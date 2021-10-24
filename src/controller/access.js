const mailer = require("../module/mailer")
const moment = require("moment")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const modelUser = require("../model/user")
const crypto = require("crypto")
const path = require("path")
const { sendMessage } = require("../controller/logsSlack")


async function login (req, res) {

    const { userName, pass } = req.body

    const user = await modelUser.findOne({ userName: userName })

    const authPass = await bcrypt.compare(pass, user.pass)

    try{
        if (userName == user.userName && authPass == true){
            const id = user._id
            if(user.aproved == true){
                const token = jwt.sign({ id }, process.env.SECRET, {
                    expiresIn: 10000
                })

                return res.status(200).json({
                    auth: true,
                    token: token    
                })
            }else{
                return res.status(400).json({status:"User not aproved, contact the administrator!"})
            }
        }
        else{
            
            const userName = userName == user.userName
            
            console.log(userName);

            switch (userName) {
                case false:
                    console.log("nome");
                    await sendMessage(`username missmatch`)
                    break;
            
                case true:
                    await sendMessage(`${userName} password missmatch`)
                    console.log("senha");
                    break;
            }
            
            return res.status(400).json({status:"usuario ou senha incorretos"})
        }
    }
    catch(error){
        console.log(error);
        return res.status(404).json({status:"Erro de autenticação usuario e senha não conferem!"})
    }

}

async function sendEmail(req, res) {

    const { email } = req.body

    try {

        const user = await modelUser.findOne({ email: email })
        const URL = "http://localhost:4000/"

    if(!user){

        return res.status(400).json({ status:"User not find!" })
    }

        const token = crypto.randomBytes(20).toString("hex")
        const userName = user.userName

        const now = new Date()
        now.setHours(now.getHours()+1)

        await modelUser.findByIdAndUpdate(user._id, {
            "$set": {
                "passwordResetToken": token,
                "passwordResetExpires": now
            }
        })

        mailer.sendMail({
            to: "andersonjulio15@gmail.com",
            from: "anderson_julio_15@hotmail.com",
            template: "auth/forgot_Password",
            subject:"Alteração de senha - Kipiai",
            context: { token, userName, URL }
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

async function verifyTokenLink(req,res) {
    const reciviedToken = req.query.token
    const user = await modelUser.findOne({ passwordResetToken:reciviedToken })
    const now = new Date()

    console.log(now);

    if (!user){
        return res.status(400).json({status:"Invalid link"})
    }

    if (user.passwordResetExpires > now ){

        return res.status(400).json({status:"Link expirado"})

    }

    return res.status(200).json({staus:"Link validado"})

}

async function changePassword(req, res) {
    const reciviedToken = req.query.token
    const { pass } = req.body
    const user = await modelUser.findOne({
        passwordResetToken: reciviedToken
    })

    console.log(user);
    
    await modelUser.findByIdAndUpdate(user._id, {
        "$set": {
            "pass": pass
        }
    })
    return res.status(200).json({status:"Senha alterada"})
}

module.exports = {
    login,
    sendEmail,
    changePassword,
    verifyTokenLink
}