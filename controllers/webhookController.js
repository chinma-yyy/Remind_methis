const { TwitterApi } = require('twitter-api-v2');
const chrono=require('chrono-node');
const crypto=require('crypto');

const client = new TwitterApi({ clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET });

function containsLink(text){

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
    if (body.direct_message_events) {
        let message_data = body.direct_message_events[0].message_create.message_data.text;//storing the message text using json sent by twitter
        message_data=message_data.trimStart();
        let userId = body.direct_message_events[0].message_create.sender_id;;//Storing the userId of the user doing the event
        console.log("Start");
        console.log(message_data);
        if(message_data=='archive'){
            //send recent 5 tweets from db
        }
        else if(message_data=='reminders'){
            //send recent 5 tweets with reminder flag on
        }
        else if(containsLink(message_data)){
            //only store in db
        }
        else{
            const dateTime=chrono.parseDate(message_data).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

        }
    }

}