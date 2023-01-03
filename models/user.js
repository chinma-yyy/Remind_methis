const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema=new Schema({
    username:{
        type:String,//twitter username of the user
        required:true
    },
    name:{
        type:String,//twitter name of the user
        required:true
    },
    password:{
        type:String,
    },
    userId:{
        type:String,//twitter user id of the user
        required:true
    },
    pf_Url:{
        type:String//profile image url
    },
    token:{
        type:String//token to reset or set password
    },
    tags:{
        type:[String]//tags given to the tweets by user 
    }
});

module.exports=mongoose.model('User',userSchema);