const mongoose = require("mongoose")
const uri = "mongodb+srv://anderson:doka1@tikos-project.ugnaf.gcp.mongodb.net/kipiai?retryWrites=true&w=majority"
var options = {
    useUnifiedTopology: true,
    useNewUrlParser: true
}

try {
    mongoose.connect(uri, options)
    console.log("Banco conectado!");
    
} catch (err) {
    console.log(err);
}

module.exports = mongoose