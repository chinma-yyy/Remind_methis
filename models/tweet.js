const mongooose = require('mongoose');
const Schema = mongooose.Schema;

const tweetSchema = new Schema({
    userId: [{
        type: Schema.Types.ObjectId,//link  to the user model created by
        ref: 'User'
    }],
    tweetURL: {
        type: String,//Long url of the tweet
        required: true
    },
    remindTime: {
        type: Date,//date to remind the user in default time zone
    },
    remindFlag: {
        type: Boolean,// If the tweet saved is to  be reminded or not
        required: true
    },
    tags: {
        type: [String],//tags given to the tweet 
    }
}
);

module.exports = mongooose.model('Tweet', tweetSchema);