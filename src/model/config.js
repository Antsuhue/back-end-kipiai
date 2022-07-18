const mongoose = require("mongoose")

const config = new mongoose.Schema({
    id:{
        type:String
    },
    views:{
        type:Array
    }

})

const Config = mongoose.model("config", config, "config")

module.exports = Config