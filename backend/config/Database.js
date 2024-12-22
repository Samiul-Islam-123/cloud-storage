const mongoose = require('mongoose');

const ConnectToDatabase = async (URL) => {
    //function to connect server with Mongo DB
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(URL);
        console.log("Connection established with MongoDB")
    }
    catch (error) {
        console.log(error)
        throw error
    }
}

module.exports = ConnectToDatabase;