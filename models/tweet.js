const mongooose = require('mongoose');
const Schema = mongooose.Schema;

const tweetSchema = new Schema({
    userId: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    tweetURL: {
        type: String,
        required: true
    },
    remindTime: {
        type: Date,
    },
    remindFlag: {
        type: Boolean,
        required: true
    },
    tags: {
        type: [String],
    }
}
);

module.exports = mongooose.model('Tweet', tweetSchema);