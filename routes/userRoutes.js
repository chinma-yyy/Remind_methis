const express=require('express');
const router = express.router;

const userController=require('../controllers/userController');

router.post('/login',userController.login);

router.post('/signup',userController.signup);

module.exports = router;