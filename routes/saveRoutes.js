const express=require('express');
const router = express.Router();

const saveController=require('../controllers/saveController');

router.get('/',saveController.save);

module.exports=router;