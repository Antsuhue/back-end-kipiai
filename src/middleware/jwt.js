const modelUser = require("../model/user")

const jwt = require("jsonwebtoken")
require("dotenv")

function verifyToken(req, res, next) {
    const token = req.headers["x-access-token"]

    if (!token) return res.status(401).json({ auth:false, message:"No token provided," }) 
    
    jwt.verify(token, process.env.SECRET, async(err, decoded) => {
        if (err) return res.status(500).json({ auth: false, message: "Failed to authenticate token." })

        const user = await modelUser.findById(decoded.id)

        req.useId = decoded.id
        next()
    })
}

module.exports = {
    verifyToken
}
