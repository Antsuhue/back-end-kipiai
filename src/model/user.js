const mongoose = require("mongoose")

const user = new mongoose.Schema({
    name:{
        type:String,
        require: true  
    },
    userName:{
        type:String,
        require:true,
        unique:true
    },
    email:{
        type:String,
        unique:true,
        require:true
    },
    pass: {
        type: String,
        require: true
    },
    forgotToken:{
        type: String
    },
    expireDateToken:{
        type:Date
    }
})

const User = mongoose.model("users", user, "users")

module.exports = User