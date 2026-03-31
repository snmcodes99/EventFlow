const mongoose = require('mongoose');


const ConnectToDB = ()=>{
    try{
        mongoose.connect("mongoURL");
        console.log("Connected To DB");
    }catch(error){
        console.log(error);

    }
}

module.exports = ConnectToDB;
