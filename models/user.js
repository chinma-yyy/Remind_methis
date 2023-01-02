const mongoose = require('mongoose');
const { tweets } = require('../controllers/appController');
const Schema = mongoose.Schema;

const userSchema=new Schema({
    username:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
    },
    userId:{
        type:String,
        required:true
    },
    pf_Url:{
        type:String
    },
    token:{
        type:String
    },
    tags:{
        type:Array
    }
});

module.exports=mongoose.model('User',userSchema);