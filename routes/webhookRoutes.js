const express=require('express');
const router=express.Router();

const webhookController=require('../controllers/webhookController');

router.get('/',webhookController.get);//Handle CRC token by twitter

router.post('/',webhookController.post);//Recieve all events from twitter on this endpoint

module.exports=router;