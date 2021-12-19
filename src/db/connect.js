const mongoose = require("mongoose")
require("dotenv/config")

const uri = process.env.MONGO_URI
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