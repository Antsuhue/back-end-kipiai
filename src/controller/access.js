const { sendMessage } = require("../controller/logsSlack")
const moment = require("moment")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const modelUser = require("../model/user")

async function login (req, res) {

    const { userName, pass } = req.body

    const user = await modelUser.findOne({ userName: userName })
    const id = user._id

    try{
        if (userName == user.userName && bcrypt.compare(pass, user.pass)){
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
        return res.status(500).json({status:error})
    }

}

function forgotPassword(req, res) {

    
}

module.exports = {
    login   
}