const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        uniqueue : true
    },
    password : {
        type : String,
        required : true
    },
    timestamp : {
        type : Date,
        default : Date.now
    },
    otp : {
        type : String
    },
    verified : {
        type : Boolean,
        default : false,

    }
})

const UserModel = new mongoose.model('User', UserSchema);

module.exports = UserModel;