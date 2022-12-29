const { TwitterApi } = require('twitter-api-v2');
const chrono = require('chrono-node');
const crypto = require('crypto');
const Admin = require('../models/admin');

// const client = new TwitterApi({ clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET });

function containsLink(text) {

}

async function sendDM(message) {
    const userDoc = await Admin.findOne({ user: 'All details' });
    const pRefreshToken = userDoc.oauth_refresh_token;
    const pAccesstoken = userDoc.oauth_acces_token;
    console.log(pRefreshToken);
    console.log(pAccesstoken);
    
    try {
        const v2client = new TwitterApi(pAccesstoken);
        // console.log(v2client);
        const { dm_conversation_id, dm_event_id } = await v2client.v2.sendDmToParticipant(process.env.USER_ID, {
            text: message,
        })
    }
    catch (err) {
        console.log("error");
        const client = new TwitterApi({ clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET });
        console.log("user created");
        console.log(pRefreshToken);
        const { client: refreshedClient, accessToken, refreshToken: newRefreshToken } = await client.refreshOAuth2Token(pRefreshToken);
        const { dm_conversation_id, dm_event_id } = await refreshedClient.v2.sendDmToParticipant(process.env.USER_ID, {
            text: message,
        });
        const userDoc = await Admin.updateOne({ user: 'All details' }, { oauth_acces_token: accessToken, oauth_refresh_token: newRefreshToken }).then(obj => { console.log(obj) }).catch(err => { console.log(err) });
        console.log("error finished");

        // console.log(err);
    }
    
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
    var body = req.body; //store the body
    let count;
    console.log(body);
    if (body.direct_message_events) {
        count=count +1;
        console.log(count);
        let message_data = body.direct_message_events[0].message_create.message_data.text;//storing the message text using json sent by twitter
        message_data = message_data.trimStart();
        let userId = body.direct_message_events[0].message_create.sender_id;;//Storing the userId of the user doing the event
        console.log("Start");
        console.log(message_data);
        if (message_data == 'archive') {
            //send recent 5 tweets from db
        }
        else if (message_data == 'reminders') {
            //send recent 5 tweets with reminder flag on
        }
        else if (containsLink(message_data)) {
            //only store in db
        }
        else {
            // const dateTime=chrono.parseDate(message_data).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
            sendDM("I have received your message. I will remind you at the specified time.");

        }
    }

}