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
    passwordResetToken:{
        type: String,
        select: false
    },
    passwordResetExpires:{
        type:Date
    },
    approved:{
        type: Boolean,
        require: true
    }
})

const User = mongoose.model("users", user, "users")

module.exports = User