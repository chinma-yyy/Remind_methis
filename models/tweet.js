const mongooose=require('mongoose');
const Schema=mongooose.Schema;

const tweetSchema=new Schema({
    tweetURL:{
        type:String,
        required:true
    },
    tweetId:{
        type:String,
        required:true
    },
    remindTime:{
        type:Date,
    }
},
{timestamps:true}
);

module.exports=mongooose.model('Tweet',tweetSchema);