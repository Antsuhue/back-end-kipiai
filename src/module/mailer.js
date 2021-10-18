const path = require("path")
const nodemailer = require("nodemailer")
const hbs = require("nodemailer-express-handlebars")

const { host, port, user, pass, service, userHot, passHot} = require("../config/mail.json")

const transport = nodemailer.createTransport({
    service,
    port,
    auth: {
      user: userHot,
      pass: passHot,
    }
  });

  transport.use("compile", hbs({
    viewEngine: {
      extName: ".html",
      partialsDir: path.resolve('./src/resources/mail'),
      defaultLayout: false,
  },
      viewPath: path.resolve("./src/resources/mail"),
      extName: ".html"
  }))

  module.exports = transport