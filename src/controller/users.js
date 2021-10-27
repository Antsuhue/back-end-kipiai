const axios = require("axios")
const bcrypt = require("bcrypt")
const modelUser = require("../model/user")
const { sendMessage } = require("./logsSlack")
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

        const createUser = await modelUser.create({ 
            "name": name.toLowerCase(),
            "userName": userName,
            "email": email.toLowerCase(),
            "pass": hash,
            "aproved": false

         })

        await sendMessage("Usuario Criado com sucesso!")

        return res.status(200).json({ createUser })

    }catch(error){
        console.log(error);
        return res.status(401).json({ status:"Failed to create a user try again!" })
    }

}

module.exports = { testeGoogle, createUsers }
