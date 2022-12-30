const mongooose=require('mongoose');
const Schema=mongooose.Schema;

const tweetSchema=new Schema({
    userId:[{
        type:Schema.Types.ObjectId,
        ref:'User'
    }],
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
    tags:{
        type:Array,
    }
},
{timestamps:true}
);

module.exports=mongooose.model('Tweet',tweetSchema);