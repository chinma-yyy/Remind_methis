const express=require('express');
const router=express.Router();

const webhookController=require('../controllers/webhookController');

router.get('/',webhookController.get);

router.post('/',webhookController.post);