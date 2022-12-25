const express=require('express');
const router = express.router;

const appController=require('../controllers/appController');

router.post('/reminder',appController.reminder);

router.post('/archive',appController.archive);

router.post('/count',appController.count);

router.post('/tweet',appController.tweets);

module.exports=router;