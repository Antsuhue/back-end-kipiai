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
    emailTokenValidation:{
        type: String,
        select: false
    },
    emailConfirmationExpires:{
        type:Date
    },
    approved:{
        type: Boolean,
        require: true
    },
    emailConfirmed:{    
        type: Boolean,
        require: true
    },
    views:{
        type: Array
    }
})

const User = mongoose.model("users", user, "users")

module.exports = User