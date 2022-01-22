const mailer = require("../module/mailer")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const modelUser = require("../model/user")
const crypto = require("crypto")
const path = require("path")
const { logsAccess } = require("../controller/logsGenerate")
const { logMessageAccess, logEmail } = require("../controller/logsSlack")


async function login (req, res) {

    console.log("teste")

    let { userName, pass } = req.body

    userName = userName.toLowerCase()

    const user = await modelUser.findOne({ userName: userName })


    const authPass = await bcrypt.compare(pass, user.pass)

    try{
        if (userName == user.userName && authPass == true){
            const id = user._id
            if(user.approved == true){
                const token = jwt.sign({ id }, process.env.SECRET, {
                    expiresIn: 10000
                })

                return res.status(200).json({
                    auth: true,
                    token: token    
                })
            }else{
                logsAccess(userName,`Administrator not approved user ${userName}`, "error")
                return res.status(400).json({status:"Usuário não aprovado, contatate o administrador!"})
            }
        }
        else{
            
            const verifyUserName = userName == user.userName
            
            console.log(verifyUserName);

            switch (verifyUserName) {
                case false:
                    await logMessageAccess(`username missmatch`)
                    break;
            
                case true:
                    logsAccess(userName,`${userName} password missmatch`)
                    await logMessageAccess()
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

    let { access } = req.body

    cred = access.toLowerCase()

    try {
        const { userHot } = require("../config/mail.json")
        const user = await modelUser.findOne({
            $or:[
            { email: cred },
            { userName: cred }
        ]   
    })
        const URL = "http://localhost:8081/"

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
            to: user.email,
            from: userHot,
            template: "auth/forgot_Password",
            subject:"Alteração de senha - Kipiai",
            context: { token, userName, URL }
        }, (err,res) => {
            if (err){
                console.log(err)
            }
        })
        logsAccess(user.userName,`Message has sended to ${user.email}`, "info")
        await logEmail(`Message has sended to ${user.email}`)

        return res.status(200).json({ status:"E-mail has sended!" })
            

    } catch (error) { 
        console.log(error)
        console.log("Error on forgot email!");
    }
    
}

// Criação de função para verificação de email cadastrado.

async function emailConfirmation (id, email){

    const { userHot } = require("../config/mail.json")
    const URL = "http://localhost:8081/"

    try{

        const token = crypto.randomBytes(20).toString("hex")
        
        const now = new Date()
        now.setHours(now.getHours()+999)

        await modelUser.findByIdAndUpdate(id, {
            "$set": {
                "emailTokenValidation": token,
                "emailConfirmationExpires": now
            }
        })

        mailer.sendMail({
            to: email,
            from: userHot,
            template: "auth/verification",
            subject: "Verificação de email - Kipiai",
            context: {token, URL}
        }, async (err,res) => {
            await logEmail(`Message verification link has sended to ${email}`)
        })
    }
    catch(err){
        console.log(err);
    }
}

async function setConfirmation(req, res) {
    const { token } = req.query

    const user = await modelUser.findOne({ emailTokenValidation:token })

    if (!user){
        return res.status(400).json({ status: "link invalid!"})
    }

    if ( user.emailTokenValidation == true){
        return res.status(200).json({ status:"email already validate!" })
    }

    await modelUser.findByIdAndUpdate(user._id, {
        "$set": {
            "emailConfirmed": true,
        }
    })
    logsAccess(user.userName,`${user.email} has confirmed`, "info")
    return res.status(200).json({token:"email validate!"})
    
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
    const now = new Date()
    const user = await modelUser.findOne({
        passwordResetToken: reciviedToken
    })

    if (!user)  {
        return res.status(400).json({ status: "Link inválido!"})
    }

    if (user.passwordResetExpires <= now){
        return res.status(400).json({ status: "Link expirado"})
    }

    const salt = bcrypt.genSaltSync(parseInt(process.env.SALT))
    const hash = bcrypt.hashSync(pass, salt) 

    const newDate = now.setHours(now.getHours()-99)
    
    await modelUser.findByIdAndUpdate(user._id, {
        "$set": {
            "pass": hash,
            "passwordResetExpires": newDate
        }
    })
    return res.status(200).json({status:"Senha alterada"})
}

module.exports = {
    login,
    sendEmail,
    changePassword,
    verifyTokenLink,
    emailConfirmation,
    setConfirmation
}