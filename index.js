const express = require("express")
const db = require("./src/db/connect")
const routes = require("./src/routes")
const cors = require("cors")
require("dotenv/config")

const app = express()
const PORT = process.env.PORT


app.use(cors())
app.db = db
app.use(express.json())
app.use(routes)

app.listen(PORT, ()=> {
    console.log(`Servidor iniciado em: http://localhost:${PORT}`);
})