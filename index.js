const express = require("express")
const expressSession = require('express-session')
const cookieParser = require('cookie-parser')
const db = require("./src/db/connect")
const routes = require("./src/routes")
const cors = require("cors")
const cron = require("node-cron")
require("dotenv/config")


const app = express()
const PORT = process.env.PORT

cron.schedule("* * * * *", () =>
    console.log("O guizão sumiu!")
)

app.use(cors())
app.db = db
app.use(express.json())
app.use(cookieParser())
app.use(routes)
app.use(express.static('views'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(expressSession({ secret: 'as!883@bnr$', resave: true, saveUninitialized: true }))

app.listen(PORT,()=> {
    console.log(`Servidor iniciado em: http://localhost:${PORT}`);
})