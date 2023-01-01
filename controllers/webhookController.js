const { TwitterApi } = require('twitter-api-v2');
const chrono = require('chrono-node');
const crypto = require('crypto');
const Admin = require('../models/admin');
const Tweet = require('../models/tweet');
const User = require('../models/user');

async function sendDM(message, userId) {
    const userDoc = await Admin.findOne({ user: 'All details' });
    const pRefreshToken = userDoc.oauth_refresh_token;
    const pAccesstoken = userDoc.oauth_acces_token;
    console.log(pRefreshToken);
    console.log(pAccesstoken);

    // try {
    //     console.log("try block");
    //     const v2client = new TwitterApi(pAccesstoken)
    //     console.log("Direct user created");
    //     console.log(v2client);
    //     const { dm_conversation_id, dm_event_id } = await v2client.v2.sendDmToParticipant(userId, {
    //         text: message,
    //     });
    //     console.log("message sent");


    // }
    // catch (err) {
    console.log("error");
    // console.log(err);
    const client = new TwitterApi({ clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET });
    console.log(client);
    // const client = new TwitterApi(pAccesstoken);
    console.log("Client created");
    console.log(pRefreshToken);
    try {
        const { client: refreshedClient, accessToken, pRefreshToken: newRefreshToken } = await client.refreshOAuth2Token(pRefreshToken)
            .then(obj => { console.log("obj: "+obj); });
        console.log("token refreshed");
        console.log(pRefreshToken);
        console.log(accessToken);
        const userDoc = Admin.updateOne({ user: 'All details' }, { oauth_acces_token: accessToken, oauth_refresh_token: newRefreshToken })
            .then(obj => { console.log(obj) })
            .catch(err => { console.log(err) });
        // console.log("No refresh error");

        const { dm_conversation_id, dm_event_id } = refreshedClient.v2.sendDmToParticipant(userId, {
            text: "Refreshed token ",
        }).then(obj => { console.log("Message sent") })
            .catch(err => {
                console.log(err);
            });

    }
    catch (err) {
        console.log("Main client error");
        console.log(err);
    }
    // }

}

exports.get = (req, res, next) => {

    var crc_token = req.query.crc_token;
    console.log(crc_token);
    if (crc_token) {
        var hash = crypto.createHmac('sha256', process.env.CONSUMER_SECRET).update(crc_token).digest('base64');

        res.status(200);
        var response_token = 'sha256=' + hash;
        console.log(response_token);
        var json = {
            "response_token": response_token
        }
        console.log(json);

        res.json({
            "response_token": response_token
        })
    } else {
        res.status(400);
        res.send('Error: crc_token missing from request.')
    }

}

exports.post = (req, res, next) => {
    var body = req.body; //store the body of the request
    // console.log(process.env.USER_ID);
    if (body.direct_message_events) {
        console.log(body);
        let recipientId = body.direct_message_events[0].message_create.target.recipient_id;
        let senderId = body.direct_message_events[0].message_create.sender_id;
        let user = body.users;
        console.log("useer: " + user);
        console.log("Sender Id: " + senderId);
        console.log("Self created");
        if (senderId != "1606266324094955521") {
            console.log("Not self created");
            let message_data = body.direct_message_events[0].message_create.message_data.text;//storing the message text using json sent by twitter
            let urls = body.direct_message_events[0].message_create.message_data.entities.urls;
            let hashtags = body.direct_message_events[0].message_create.message_data.entities.hashtags;
            // console.log(hashtags);
            console.log("----");
            // console.log(urls);
            message_data = message_data.trimStart();
            message_data = message_data.toLowerCase();
            message_data = message_data.trimEnd();
            let userId = body.direct_message_events[0].message_create.sender_id;;//Storing the userId of the user doing the event
            console.log("Start");
            console.log(message_data);
            if (message_data == 'archive') {
                //send recent 5 tweets from db
                sendDM("Here are your recent 5 tweets", senderId);
            }
            else if (message_data == 'reminders') {
                //send recent 5 tweets with reminder flag on
                sendDM("Here are your recent 5 reminders", senderId);
            }
            else if (chrono.parseDate(message_data)) {
                console.log("Date found");
                const dateTime = chrono.parseDate(message_data).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
                sendDM("I have received your message. I will remind you at the specified time." + dateTime, senderId);

            }
            else {
                sendDM("Samajh nahi aaya bhai kya bol raha hai.!!! ", senderId);
            }
        }
    }

}