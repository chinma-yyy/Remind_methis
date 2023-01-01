const Tweet=require('./models/tweet');

const tweets=Tweet.sort({createdAt:-1}).limit(5);
console.log(tweets);