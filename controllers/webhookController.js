//All packages
const { TwitterApi } = require('twitter-api-v2');
const chrono = require('chrono-node');
const crypto = require('crypto');
const axios = require('axios');
//All models
const Admin = require('../models/admin');
const Tweet = require('../models/tweet');
const User = require('../models/user');

//Function to the send Direct Message to user
async function sendDM(message, userId) {
    const userDoc = await Admin.findOne({ user: 'All details' });
    //retrieve tokens from db
    const pRefreshToken = userDoc.oauth_refresh_token;
    const pAccesstoken = userDoc.oauth_acces_token;

    try {
        const v2client = new TwitterApi(pAccesstoken);//create client with access token as bearer token
        const sent1 = await v2client.v2.sendDmToParticipant(userId, {
            text: message,
        }).then(result => {
            console.log("message sent");
        }
        );
        //If token expires renew in catch block and send DIrect message
    }
    catch (err) {
        const v2client = new TwitterApi({ clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET });//Client using developer keys
        let refreshToken;
        let accessToken;
        try {
            const refresh = await v2client.refreshOAuth2Token(pRefreshToken)//Refresh the token
                .then(obj => {
                    let body = JSON.stringify(obj);//JSON obj ko string karke firse json to acces it
                    let json = JSON.parse(body);
                    refreshToken = json.refreshToken;
                    accessToken = json.accessToken;
                });

            const refreshedClient = new TwitterApi(accessToken);//New client on new tokens
            const userDoc = Admin.updateOne({ user: 'All details' }, { oauth_acces_token: accessToken, oauth_refresh_token: refreshToken })//Update the Tokens in db
                .then(obj => {
                    console.log("updated succesfully");
                })
                .catch(err => { console.log(err) });
            const sent2 = refreshedClient.v2.sendDmToParticipant(userId, {
                text: message,
            }).then(obj => { console.log("Message sent") })//Send dm from new refreshed client
                .catch(err => {
                    console.log(err);
                });

        }
        catch (err) {
            console.log("Main client error");//Kuchh toh jhol hai bahut bada
            console.log(err);
        }
    }

}

//Twitter will give crc token hash map it with your consumer secret and then send it in json response to verify
//twitter verifies this every 24 hours to set the webhook as active
//Status code 200 should also be set
exports.get = (req, res, next) => {

    var crc_token = req.query.crc_token;
    // console.log(crc_token);
    if (crc_token) {
        var hash = crypto.createHmac('sha256', process.env.CONSUMER_SECRET).update(crc_token).digest('base64');

        res.status(200);
        var response_token = 'sha256=' + hash;
        console.log(response_token);
        var json = {
            "response_token": response_token
        }
        // console.log(json);

        res.json({
            "response_token": response_token
        })
    } else {
        res.status(400);
        res.send('Error: crc_token missing from request.')
    }

}

//Handle all the events sent on the webhook
exports.post = async (req, res, next) => {
    var body = req.body; //store the body of the request
    if (body.direct_message_events) {
        let senderId = body.direct_message_events[0].message_create.sender_id;
        if (senderId != "1606266324094955521") {//Khudka event ko case mei na lena

            let message_data = body.direct_message_events[0].message_create.message_data.text;//storing the message text using json sent by twitter
            let urls = body.direct_message_events[0].message_create.message_data.entities.urls;//Url array with short url expanded url display url 
            let hashtags = body.direct_message_events[0].message_create.message_data.entities.hashtags;//Array of all the hashtags and their indices in the text
            let htLenght = hashtags.length;
            //Format the message
            message_data = message_data.trimStart();
            message_data = message_data.toLowerCase();
            message_data = message_data.trimEnd();

            //Check if user nahi hai toh create
            const search = await User.findOne({ userId: senderId }).then(userDoc => {
                if (!userDoc) {
                    const client = new TwitterApi(process.env.BEARER_TOKEN);
                    const userinfo = client.v2.user(senderId, { 'user.fields': ['profile_image_url', 'username', 'name'] }).then(user => {
                        const string = JSON.stringify(user);
                        const parse = JSON.parse(string);
                        let pf_url = parse.data.profile_image_url;
                        let name = parse.data.name;
                        let username = parse.data.username;
                        let token = crypto.randomBytes(6).toString('hex');
                        const newUser = new User({
                            username: username,
                            name: name,
                            userId: senderId,
                            pf_Url: pf_url,
                            token: token
                        })
                        newUser.save().then(result => { console.log("user saved"); });
                    }
                    );
                }
            }).catch(err => { console.log(err); })
            console.log(message_data);

            //Command handling by the bot
            if (message_data == 'reminders') {
                //send recent 5 tweets with reminder flag on
                const dbLook = await User.findOne({ userId: senderId }).then(userDoc => {
                    return userDoc._id;
                }).then(Id => {
                    const tweets = Tweet.find({ userId: Id, remindFlag: true }).sort({ remindTime: -1 }).then(doc => {
                        if (doc != []) {
                            return sendDM("Pehle kuchh bhej toh reminder set karne ko", senderId);//If no reminders set
                        }
                        sendDM("Here are your recent reminders", senderId);
                        for (i = 0; i < doc.length; i++) {
                            sendDM(doc[i].tweetURL, senderId);
                        }
                    }).catch(err => {
                        console.log(err);
                    });
                });

            }
            //Check if there is date time present in the text
            else if (chrono.parseDate(message_data)) {
                //Check if there are url present in the text
                if (urls.length) {
                    const dateTime = chrono.parseDate(message_data).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });//Local date string
                    const dt = chrono.parseDate(message_data);//Date time object in default tomezone

                    //Check if there are tags for the tweet
                    if (!htLenght) {
                        const user = await User.findOne({ userId: senderId }).then(userDoc => {
                            const newTweet = new Tweet({
                                userId: userDoc._id,
                                tweetURL: urls[0].expanded_url,
                                remindFlag: true,
                                remindTime: dt,
                                tags: 'none'
                            });
                            newTweet.save();
                        }).catch(err => { console.log(err); });
                        sendDM("I will remind you at the specified time: " + dateTime, senderId);
                    }
                    else {
                        const tags = [];
                        for (i = 0; i < htLenght; i++) {
                            console.log(hashtags[i].text);
                            tags.push(hashtags[i].text);
                        }
                        console.log(tags);
                        const update = User.updateOne({ userId: senderId }, { $addToSet: { tags: tags } }).then(result => { console.log(result); });//Add tags to the user without duplicating
                        const user = await User.findOne({ userId: senderId }).then(userDoc => {
                            const newTweet = new Tweet({
                                userId: userDoc._id,
                                tweetURL: urls[0].expanded_url,
                                remindFlag: true,
                                remindTime: dt,
                                tags: tags
                            });
                            newTweet.save();
                        }).catch(err => { console.log(err); });
                        sendDM("I will remind you at the specified time: " + dateTime, senderId);
                    }

                }
            }
            else if (urls.length) {
                let tag = '';
                for (i = 0; i < htLenght; i++) {
                    tag = tag + '&tag=' + hashtags[i].text;
                }
                let url = process.env.BASE_URL + 'save/?userId=' + senderId + '&tweet=' + urls[0].expanded_url + tag;//Constructing url with query paramters
                axios.get(url).then(result => {
                    // console.log("hua");
                }).catch(err => { console.log(err) });
                sendDM("Tweet saved :)", senderId);
            }
            else if (message_data == 'connect') {
                sendDM("Connected", senderId);
                //Aur kuchh acche se daalde for first message
            }
            else {
                sendDM("Samajh nahi aaya bhai kya bol raha hai.!!! ", senderId);
                //Invalid text recieved
            }
        }
    }

}