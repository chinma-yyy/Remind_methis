const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User=require('../models/user');

exports.login=(req,res,next)=>{
    console.log("Login controller");

}

exports.signup=(req,res,next)=>{
    console.log("Signup Controlller");
    
}