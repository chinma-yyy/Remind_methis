const Tweet =require('../models/tweet');

exports.saveTweet=(userId,URL,time,flag,tags)=>{
    if(!tags.length){
        tags=['none'];
    }
    if(flag){
        const timed=new Tweet({
            userId:userId,
            tweetURL:URL,
            remindTime:time,
            remindFlag:flag,
            tags:tags
        });
        timed.save();
    }
    else{
        const nonTimed=new Tweet({
            userId:userId,
            tweetURL:URL,
            remindFlag:flag,
            tags:tags
        })
        nonTimed.save();
    }
}