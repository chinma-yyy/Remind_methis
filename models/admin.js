const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    user:{
        type:String,
    },
    oauth_state: {
        type: String,

    },
    oauth_codeVerfier:{
        type:String,
    },
    oauth_refresh_token:{
        type:String,
    },
    oauth_acces_token:{
        type:String,
    },
    expiresIn:{
        type:String,
    }
})
module.exports=mongoose.model('Admin',adminSchema);