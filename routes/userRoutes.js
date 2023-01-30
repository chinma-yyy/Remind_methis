const express = require('express');
const router = express.Router();
const { body } = require('express-validator/check');
const User=require('../models/user');
const userController = require('../controllers/userController');
// const middleware=require('../middlewares/user')


router.post('/login',userController.login);

router.put('/signup', userController.signup);//Add middleware to validate password

module.exports = router;