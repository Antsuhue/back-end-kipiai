const mongoose = require("mongoose")

const connect = mongoose.connect("mongodb://localhost:27017/local", (res,err) => {
    if(err){
        console.log(err);
    }
    else{
        console.log("Banco conectado!");
    }
})