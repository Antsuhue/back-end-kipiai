const express = require("express")
const router = express.Router()
const { login } = require('./controller/access')
const { testeGoogle } = require('./controller/users')

router.get("/", (req,res) => {
    res.send("Hello World")
})

router.post("/login", login)

router.get("/tes", testeGoogle)

router.post("/logout", (req, res) => {
    res.json({ auth: false, token: null })
    console.log("Deslogado!");
})


module.exports = router