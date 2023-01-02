const User = require('../models/user');
const Tweet = require('../models/tweet');

exports.save = async (req, res, next) => {
    const userId = req.query.userId;
    const tweetURL = req.query.tweet;
    const tag=req.query.tag;
    const user = await User.findOne({ userId: userId }).then(userDoc => {
      const newTweet=new Tweet({
        userId:userDoc._id,
        tweetURL:tweetURL,
        remindFlag:false,
        remindTime:new Date(),
        tags:tag,
      });
      newTweet.save();
    }).catch(err => { console.log(err); });
    res.json({ message: "tweet saved" });
  };

