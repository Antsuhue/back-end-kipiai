const express = require("express")
const mongoose = require("mongoose")
const routes = require("./src/routes")
const cors = require("cors")
require("dotenv/config")

const app = express()
const PORT = process.env.PORT


app.use(cors())
app.use(express.json())
app.use(routes)

app.listen(PORT, ()=> {
    console.log(`Servidor iniciado em: http://localhost:${PORT}`);
})