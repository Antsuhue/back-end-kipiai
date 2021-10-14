const { sendMessage } = require("../controller/logsSlack")
const moment = require("moment")
const jwt = require("jsonwebtoken")

const userTeste = {
    "id":55,
    "userName":"antsu",
    "name":"Anderson",
    "email":"anderson@anderson.com",
    "address": "Rua Teste",
    "telephone": "11948039943",
    "pass": "adm"
}

async function login (req, res) {

    const body = req.body

    const idUser = userTeste.id

    try{
        if (body.userName == userTeste.userName && body.pass == userTeste.pass){
            const token = jwt.sign({ idUser }, process.env.SECRET, {
                expiresIn: 10000
            })
            return res.status(200).json({
                auth: true,
                token: token    
            })
        }
        else{
            
            const userName = body.userName == userTeste.userName
            
            console.log(userName);

            switch (userName) {
                case false:
                    console.log("nome");
                    await sendMessage(`username missmatch`)
                    break;
            
                case true:
                    await sendMessage(`${body.userName} password missmatch`)
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

module.exports = {
    login   
}