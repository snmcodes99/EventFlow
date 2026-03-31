const mongoose = require('mongoose');


const ConnectToDB = ()=>{
    try{
        mongoose.connect("mongodb+srv://chessashishrautela:XsRNVcUpcqCb4ABi@cluster0.3g8fqtt.mongodb.net/Projects?appName=Cluster0");
        console.log("Connected To DB");
    }catch(error){
        console.log(error);

    }
}

module.exports = ConnectToDB;