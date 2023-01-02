const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi({ clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET });

const User = require('../models/user');
const Admin = require('../models/admin');

exports.login = async (req, res, next) => {
    console.log("Login controller");
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({ username: username }).then(user => {
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 401;
            throw error;
        }
        loadedUser = user;
        return bcrypt.compare(password, user.password);
    }).then(isEqual => {
        if (!isEqual) {
            const error = new Error('Wrong passord');
            error.statusCode = 401;
            throw error;
        }
        // const token=jwt.sign({
        //     email:loadedUser.email,
        //     userId:loadedUser._id
        // },
        // 'remindmethis'
        // );
        res.status(201).json({ userId: loadedUser._id })
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}
exports.signup = async (req, res, next) => {
    console.log("Signup Controlller");
    const password = req.body.password;
    const twitterUsername = req.body.username;
    console.log(password + twitterUsername);
    User.findOne({username:username}).then(user=>{
        if(!user){

        }
        console.log("userfound");
    })
    // Authlink generation
    // console.log("Authlink");
    // const { url, codeVerifier, state } = await client.generateOAuth2AuthLink(process.env.CALLBACK_URL, { scope: ['tweet.read', 'users.read', 'offline.access', 'dm.read', 'dm.write'] });
    // console.log(url);
    // console.log("---");
    // console.log(codeVerifier);
    
    bcrypt.hash(password, 12).then(hashedPw => {
        // const user = new User({
        //     email: email,
        //     name: name,
        //     password: hashedPw,
        //     twitterUsername: twitterUsername,
        //     twitterUserid: twitterId
        // })
        // return user.save();
        console.log("saving");
    }).then(result => {
        res.status(201).json({ message: 'User created successfully', userId: result._id })
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};