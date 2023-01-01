const mongooose=require('mongoose');
const Schema=mongooose.Schema;

const tweetSchema=new Schema({
    userId:[{
        type:Schema.Types.ObjectId,
        ref:'User'
    }],
    shortUrl:{
        type:String,
        required:true
    },
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
    },
    remindFlag:{
        type:Boolean
    },
    tags:{
        type:Array,
    }
},
{timestamps:true}
);

module.exports=mongooose.model('Tweet',tweetSchema);