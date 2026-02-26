const mongoose = require("mongoose")

const dbConnect = async () =>{
    try{
        await mongoose.connect(process.env.DB_URI)
        console.log("Database connected successfully")
    }catch(error){
        console.log("Database connection failed", error)
    }
}

module.exports = dbConnect ;