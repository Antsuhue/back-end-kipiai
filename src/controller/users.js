const axios = require("axios")
const bcrypt = require("bcrypt")
const modelUser = require("../model/user")
require("dotenv")

async function testeGoogle(req, res) {
    
    const te = await axios.get("https://www.googleapis.com/auth/analytics.readonly")
    console.log(te);
    return res.json({"status":te.status}).status(200)
}

async function createUsers(req, res) {

    const { userName, name, email, pass } = req.body

    try{
        const user = await modelUser.findOne({ userName : userName })

        console.log(user);

        if(user){
            return res.status(400).json({ status:"User alredy exist!" })
        }

        const salt = bcrypt.genSaltSync(parseInt(process.env.SALT))
        console.log(salt);
        const hash = bcrypt.hashSync(pass, salt) 
        console.log(hash)

        const createUser = await modelUser.create({ 
            "name": name,
            "userName": userName,
            "email": email,
            "pass": hash,
            "aproved": false

         })

         return res.status(200).json({ createUser })

    }catch(error){
        console.log(error);
        return res.status(401).json({ status:"Failed to create a user try again!" })
    }


}

module.exports = { testeGoogle, createUsers }
