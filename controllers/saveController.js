const User = require('../models/user');
const Tweet = require('../models/tweet');
//Have to see how to  use it
exports.save = async (req, res, next) => {
    console.log("Save controller");
    const userId = req.query.userId;
    const tweetURL = req.query.tweet;
    if (req.query.tag) {
        let tag = req.query.tag;
    }
    else{
        let tag=undefined;
    }
    const user = await User.findOne({ userId: userId }).then(userDoc => {
        const newTweet = new Tweet({
            userId: userDoc._id,
            tweetURL: tweetURL,
            remindFlag: false,
            remindTime: new Date(),
            tags: tag,
        });
        newTweet.save();
    }).catch(err => { console.log(err); });
    res.json({ message: "tweet saved" });
};

