var request = require('request');



exports.sendMessage = async (req, res,next) => {
  let recipientID=req.body.userId;
  let text=req.body.text;
  // URL Link for twitter endpoint
  const urlLink = 'https://api.twitter.com/1.1/direct_messages/events/new.json';
  
  // Generating timestamp
  const ts = Math.floor(new Date().getTime() / 1000);
  const timestamp = ts.toString();

  // Authorization Parameters
  const params = {
      "oauth_version"          : "1.0",
      "oauth_consumer_key"     : process.env.CONSUMER_KEY,
      "oauth_token"            : process.env.ACCESS_TOKEN,
      "oauth_timestamp"        :  timestamp,
      "oauth_nonce"            : "AUTO_GENERATED_NONCE",
      "oauth_signature_method" : "HMAC-SHA1",
      "oauth_signature"        : "YOUR_OAUTH_SIGNATURE"
  };

  const dataString = `{"event": {"type": "message_create", "message_create": {"target": { "recipient_id": "${recipientID}"},"message_data": {"text": "${text}"}}}}`;

  const options = {
      url: urlLink,
      headers: {
       "Authorization": `OAuth oauth_consumer_key="${params.oauth_consumer_key}", oauth_nonce= ${params.oauth_nonce}, oauth_signature= ${params.oauth_signature}, oauth_signature_method="HMAC-SHA1", oauth_timestamp=${params.oauth_timestamp},oauth_token="${params.oauth_token}", oauth_version=${params.oauth_version}`,
       "Content-type": 'application/json'
      },
      body: dataString
    }

  request.post(options, (error, response, body) =>{
      console.log(response.statusCode);
  });
}