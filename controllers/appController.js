const User =require('../models/user');
const Tweet=require('../models/tweet');

exports.archive=(req,res,next)=>{
    console.log("Archive controller");
}

exports.count=(req,res,next)=>{
    console.log("Count controller");

}

exports.reminder=(req,res,next)=>{
    console.log("Reminder comntroller");
}

exports.tweets=(req,res,next)=>{
    console.log("Tweet controlller");
}