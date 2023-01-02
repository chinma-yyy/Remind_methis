const { TwitterApi } = require('twitter-api-v2');
const chrono = require('chrono-node');
const crypto = require('crypto');
const Admin = require('../models/admin');
const Tweet = require('../models/tweet');
const User = require('../models/user');
const { captureRejectionSymbol } = require('events');

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
            message_data = message_data.trimStart();
            message_data = message_data.toLowerCase();
            message_data = message_data.trimEnd();

            const search = User.findOne({ userId: senderId }).then(userDoc => {
                if (!userDoc) {
                    const client = new TwitterApi(process.env.BEARER_TOKEN);
                    const userinfo = client.v2.user(senderId, { 'user.fields': ['profile_image_url', 'username', 'name'] }).then(user => {
                        const string = JSON.stringify(user);
                        const parse = JSON.parse(string);
                        let pf_url = parse.data.profile_image_url;
                        let name = parse.data.name;
                        let username = parse.data.username;
                        const newUser = new User({
                            username: username,
                            name: name,
                            userId: senderId,
                            pf_Url: pf_url
                        })
                        newUser.save().then(result => { console.log("user saved"); });
                    }
                    );
                }
            }).catch(err => { console.log(err); })
            console.log(message_data);
            if (message_data == 'reminders') {
                //send recent 5 tweets with reminder flag on
                // const tweets = Tweet.sort({ createdAt: -1 }).limit(5);
                sendDM("Here are your recent 5 reminders", senderId);
            }
            else if (chrono.parseDate(message_data)) {
                if (urls[0].expanded_url) {
                    console.log("dated");
                    let url = new URL('https://127.0.0.1/save');
                    let params = new URLSearchParams(url.search);

                    params.append('userId', senderId);
                    params.append('tweet', urls[0].expanded_url)
                    const redirect = '/' + params.toString();
                    console.log(redirect);
                    const dateTime = chrono.parseDate(message_data).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
                    sendDM("I have received your message. I will remind you at the specified time: " + dateTime, senderId);
                    sendDM(urls[0].expanded_url, senderId);
                    res.redirect(redirect);
                }

            }
            // else if (urls != []) {
            //     //store in db
            //     let url = new URL('https://127.0.0.1/save');
            //     let params = new URLSearchParams(url.search);

            //     params.append('userId', senderId);
            //     params.append('tweet', urls[0].expanded_url);
            //     const redirect = '/save?'+ params.toString();
            //     console.log(redirect);
            //     sendDM(urls[0].expanded_url, senderId);
            //     res.redirect(redirect);
            //     console.log("redirected");
            //     next();

            // }
            else {
                await sendDM("Samajh nahi aaya bhai kya bol raha hai.!!! ", senderId);
                res.redirect('/signup');
            }
        }
    }

}