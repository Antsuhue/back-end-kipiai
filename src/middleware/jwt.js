const jwt = require("jsonwebtoken")
require("dotenv")

function verifyToken(req, res, next) {
    const header = req.headers["authorization"]
    const bearer = header.split(' ')
    const token = bearer[1]
    console.log(header)

    if (!token) return res.status(401).json({ auth:false, message:"No token provided," }) 
    
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) return res.status(500).json({ auth: false, message: "Failed to authenticate token." })

        req.userId = decoded.id
        req.admin = decoded.admin
        next()
        
    })
}

function verifyTokenADM(req, res, next) {
    const header = req.headers["authorization"]
    const bearer = header.split(' ')
    const token = bearer[1]

    if (!token) return res.status(401).json({ auth:false, message:"No token provided," }) 
    
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) return res.status(500).json({ auth: false, message: "Failed to authenticate token." })

        if(decoded.admin == true){
            req.userId = decoded.id
            req.admin = decoded.admin
        }else{
            return res.status(401).json({ auth:true, message: "You not authorized" })
        }

        next()
        
    })
}

module.exports = {
    verifyToken,
    verifyTokenADM
}