const express = require("express")
const router = express.Router()
const { verifyToken } = require("./middleware/jwt")
const { login, sendEmail, changePassword, setConfirmation } = require('./controller/access')
const { testeGoogle, createUsers, changePermission } = require('./controller/users')

router.get("/", (req,res) => {
    res.send("Hello World")
})

router.post("/create_user", createUsers)

router.post("/login", login)

router.get("/tes", testeGoogle)

router.get("/testeList", verifyToken, (req, res) => {
    const lista = {
        usuario1:"Anderson",
        usuario2:"Guilherme"
    }
    return res.status(200).json(lista)
})

router.put("/change_permission/", changePermission)

router.post("/forgot_password/", sendEmail)

router.post("/verify/", setConfirmation)

router.post("/change_password/", changePassword)

router.post("/logout", (req, res) => {
    res.json({ auth: false, token: null })
    console.log("Deslogado!");
})


module.exports = router