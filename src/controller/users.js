const axios = require("axios")
const bcrypt = require("bcrypt")
const modelUser = require("../model/user")
const { emailConfirmation } = require("./access")
const { logsCreateUser, logsApproved, logsDisapproved } = require("./logsSlack")
require("dotenv")

async function testeGoogle(req, res) {
    
    const te = await axios.get("https://www.googleapis.com/auth/analytics.readonly")
    console.log(te);
    return res.json({"status":te.status}).status(200)
}

async function createUsers(req, res) {

    let { userName, name, email, pass } = req.body

    userName = userName.toLowerCase()

    try{
        const user = await modelUser.findOne({ userName : userName })

        if(user){
            return res.status(400).json({ status:"User alredy exist!" })
        }

        const salt = bcrypt.genSaltSync(parseInt(process.env.SALT))
        const hash = bcrypt.hashSync(pass, salt) 

        var createUser = new modelUser({ 
            "name": name.toLowerCase(),
            "userName": userName,
            "email": email.toLowerCase(),
            "pass": hash,
            "approved": false

         })

        

        await logsCreateUser("Usuario Criado com sucesso!")

        return res.status(200).json({ createUser })

    }catch(error){
        console.log(error);
        return res.status(401).json({ status:"Failed to create a user try again!" })
    }

}

function changePermission(req, res){
    const {action, userName} = req.body

    switch (action) {
        case "approve":
            approveUser(userName, res)
        break

        case "disapprove":
            disapproveUser(userName, res)
    }
}

// Usuario master terá a possibilidade de aprovar usuario no uso da plataforma.

async function approveUser(userName, res){

    const user = await modelUser.findOne({ userName:userName })

    // Verificação se usuario existe.
    if(!user){
        return res.status(404).json({ status:"Usuario não encontrado!" })
    }

    // Alterar aprovação do usuario na base de dados.
    try{
    await modelUser.findByIdAndUpdate(user._id, {
        "$set":{
            "approved":true
        }
    })
    await logsApproved(`${user.userName} has change your status to aproved`)
                return res.status(200).json({status: "Sucess to approve user!" })
    
    }
    catch (err){
        return res.status(400).json({status:`Error to aprove user, ${err}`})
          
    }

}

async function disapproveUser(userName, res){

    const user = await modelUser.findOne({ userName:userName })

    // Verificação se usuario existe.
    if(!user){
        return res.status(404).json({ status:"Usuario não encontrado!" })
    }

    // Alterar aprovação do usuario na base de dados.
    try{
    await modelUser.findByIdAndUpdate(user._id, {
        "$set":{
            "approved":false
        }
    })
    await logsDisapproved (`${user.userName} has change your status to disapproved`)
                return res.status(200).json({status: "Sucess to disapprove user!" })
    
    }
    catch (err){
        return res.status(400).json({status:`Error to disaprove user, ${err}`})
          
    }

}


module.exports = { testeGoogle, createUsers, changePermission }
