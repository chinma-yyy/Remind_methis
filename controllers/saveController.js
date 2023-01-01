const User = require('../models/user');
const Tweet = require('../models/tweet');

exports.save = (req, res, next) => {
    const userId = req.query.userId;
    const tweetURL = req.query.tweet;
    const tag=req.query.tag;
    console.log("saving");
    const user = User.findOne({ userId: userId }).then(userDoc => {
        UID = userDoc._id;
        return UID;
    }).catch(err => { console.log(err); })

    const tweet=new Tweet({
        userId:user,
        tweetURL:tweetURL,
        remindFlag:false,
        tags:tag
    })
    tweet.save();
}