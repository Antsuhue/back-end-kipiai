const mongoose = require("mongoose")

const views = new mongoose.Schema({
    viewId:{
        type: String,
        required: true
    },
    clientName:{
        type: String
    },
    goalView:{
        type: String,
        required: true
    },
    docId:{
        type: String,
        required: true
    }
    
})

const Views = mongoose.model("views", views, "views")

module.exports = Views