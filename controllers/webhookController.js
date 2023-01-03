const { TwitterApi } = require('twitter-api-v2');
const chrono = require('chrono-node');
const crypto = require('crypto');
const Admin = require('../models/admin');
const Tweet = require('../models/tweet');
const User = require('../models/user');
const { captureRejectionSymbol } = require('events');
const axios = require('axios');
const { url } = require('inspector');

async function sendDM(message, userId) {
    const userDoc = await Admin.findOne({ user: 'All details' });
    const pRefreshToken = userDoc.oauth_refresh_token;
    const pAccesstoken = userDoc.oauth_acces_token;

    try {
        const v2client = new TwitterApi(pAccesstoken)
        const sent1 = await v2client.v2.sendDmToParticipant(userId, {
            text: message,
        }).then(result => {
            console.log("message sent");
        }
        );


    }
    catch (err) {
        const v2client = new TwitterApi({ clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET });
        let refreshToken;
        let accessToken;
        try {
            const refresh = await v2client.refreshOAuth2Token(pRefreshToken)
                .then(obj => {
                    let body = JSON.stringify(obj)
                    let json = JSON.parse(body);
                    refreshToken = json.refreshToken;
                    accessToken = json.accessToken;
                });

            const refreshedClient = new TwitterApi(accessToken);
            const userDoc = Admin.updateOne({ user: 'All details' }, { oauth_acces_token: accessToken, oauth_refresh_token: refreshToken })
                .then(obj => {
                    console.log("updated succesfully");
                })
                .catch(err => { console.log(err) });
            const sent2 = refreshedClient.v2.sendDmToParticipant(userId, {
                text: message,
            }).then(obj => { console.log("Message sent") })
                .catch(err => {
                    console.log(err);
                });

        }
        catch (err) {
            console.log("Main client error");
            console.log(err);
        }
    }

}

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

exports.post = async (req, res, next) => {
    var body = req.body; //store the body of the request
    if (body.direct_message_events) {
        // console.log(body);
        let senderId = body.direct_message_events[0].message_create.sender_id;
        let user = body.users;
        let stringify = JSON.stringify(user);
        let parsedUser = JSON.parse(stringify);
        // console.log("Sender Id: " + senderId);
        if (senderId != "1606266324094955521") {

            let message_data = body.direct_message_events[0].message_create.message_data.text;//storing the message text using json sent by twitter
            let urls = body.direct_message_events[0].message_create.message_data.entities.urls;
            let hashtags = body.direct_message_events[0].message_create.message_data.entities.hashtags;
            let htLenght = hashtags.length;
            message_data = message_data.trimStart();
            message_data = message_data.toLowerCase();
            message_data = message_data.trimEnd();

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
                            token:token
                        })
                        newUser.save().then(result => { console.log("user saved"); });
                    }
                    );
                }
            }).catch(err => { console.log(err); })
            console.log(message_data);
            if (message_data == 'reminders') {
                //send recent 5 tweets with reminder flag on
                const dbLook = await User.findOne({ userId: senderId }).then(userDoc => {
                    return userDoc._id;
                }).then(Id => {
                    const tweets = Tweet.find({ userId: Id, remindFlag: false }).sort({ tweetURL: -1 }).then(doc => {
                        if(doc!=[]){
                            return sendDM("Pehle kuchh bhej toh reminder set karne ko",senderId);
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
            else if (chrono.parseDate(message_data)) {
                if (urls.length) {
                    const dateTime = chrono.parseDate(message_data).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
                    const dt = chrono.parseDate(message_data);
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
                        const update= User.updateOne({userId:senderId},{$addToSet:{tags:tags}}).then(result=>{console.log(result);});
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
                let url = process.env.BASE_URL + 'save/?userId=' + senderId + '&tweet=' + urls[0].expanded_url + tag;
                axios.get(url).then(result => {
                    // console.log("hua");
                }).catch(err => { console.log(err) });
                sendDM("Tweet saved :)", senderId);
            }
            else if(message_data=='connect'){
                sendDM("Connected",senderId);
            }
            else {
                await sendDM("Samajh nahi aaya bhai kya bol raha hai.!!! ", senderId);
            }
        }
    }

}