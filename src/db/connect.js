const mongoose = require("mongoose")
require("dotenv/config")

const uri = process.env.MONGO_URI
var options = {
    useUnifiedTopology: true,
    useNewUrlParser: true
}

try {
    mongoose.connect("mongodb+srv://anderson:doka1@tikos-project.ugnaf.gcp.mongodb.net/kipiai?retryWrites=true&w=majority", options)
    console.log("Banco conectado!");
    
} catch (err) {
    console.log(err);
}

module.exports = mongoose