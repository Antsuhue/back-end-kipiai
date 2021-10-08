const express = require("express")
const mongoose = require("mongoose")
require("dotenv/config")

const PORT = process.env.PORT

const app = express()




app.get("/", (req,res) => {
    res.send("Hello World")
})

app.listen(PORT, ()=> {
    console.log(`Servidor iniciado em: http://localhost:${PORT}`);
})