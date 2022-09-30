const mongoose = require("mongoose")

const card = new mongoose.Schema({
    clientName:{
        type:String,
        required: true
    },
    viewId:{
        type:String,
        require: true
    },
    nameCompany: {
        type:String,
    },
    adCost: {
        type:String,
        require:true
    },
    revenue:{
        type: String
    },
    costPerConversion:{
        type: String,
        require: true
    },
    costPerOrder:{
        type:String,
        required:true
    },
    lastConsult:{
        type:String
    },
    goalView:{
        type: String,
        require: true
    },
    docId:{
        type: String,
        require: true
    },
    roi:{
        type: String,
    },
    investment:{
        type: String,
    },
    recipe:{
        type: String,
    }

    
})

const Card = mongoose.model("cards", card, "cards")

module.exports = Card