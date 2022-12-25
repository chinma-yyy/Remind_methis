const express=require('express');
const router = express.router;

const appController=require('../controllers/appController');
const dmController=require('../controllers/dmController');

router.post('/dm',dmController);

router.post('/reminder',appController.reminder);

router.post('/archive',appController.archive);

router.post('/count',appController.count);

router.post('/tweet',appController.tweets);

module.exports=router;