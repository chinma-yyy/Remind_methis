const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi({ clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET });

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

    count = count + 1;
    var body = req.body; //store the body
    if (body.direct_message_events) {
        let message_data = body.direct_message_events[0].message_create.message_data.text;//storing the message text using json sent by twitter
        let userId = body.direct_message_events[0].message_create.sender_id;;//Storing the userId of the user doing the event
        const messageArray = message_data.split(" ");//splitting the dm to understand the time format
        if (messageArray.length > 1) {
            var num = messageArray[0];
            var time = messageArray[1];
            var link = messageArray[2];
            res.body.text = message_data;
            res.body.userId = userId;
            res.redirect('/app/dm');
        }
        else {

        }

        console.log("Start");
        // console.log(body);
        // console.log(event);
        // console.log(eventType);
        console.log(message_data);
        console.log("--------");
        console.log(count);
    }

}