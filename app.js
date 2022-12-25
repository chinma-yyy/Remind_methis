const express = require('express');
const crypto = require('crypto');
const request=require('request');

var count=0;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/webhook', function(req, res) {
    var crc_token = req.query.crc_token;
    console.log(crc_token);
  if (crc_token) {
    var hash = crypto.createHmac('sha256', 'CtiBUMSSFOhtqYaVsfusC8uPhjnxqkYsrYKa7eg3pBNDH3UamW').update(crc_token).digest('base64');
    
    res.status(200);
    var response_token = 'sha256=' + hash;
    console.log(response_token);
    var json={
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
});
app.post('/webhook',(req,res,next)=>{
	count=count +1;
	var body=req.body;
	if(body.direct_message_events){
	var event=body.direct_message_events[0];
	var eventType=event.type;
	var message_data;
	message_data=event.message_create.message_data.text;
	console.log("Start");
	// console.log(event);
	console.log(eventType);
	console.log(message_data);
	console.log("--------");
	console.log(count);
	}
})
// app.get('/webhook',(req, res)=> {
// 	console.log("Hello World");
// 	console.log(req.body);
// });
// app.post('/webhook', function (req, res) {
// 	var message_data;
// 	var sender_id;
// 	var metadata;
// 	var response;
// 	var oauth = {
//       consumer_key: TWITTER_CONSUMER_KEY,
//       consumer_secret: TWITTER_CONSUMER_SECRET,
//       token: TWITTER_ACCESS_TOKEN,
//       token_secret: TWITTER_ACCESS_TOKEN_SECRET
//     }

//     // check for direct message events
//     if(payload.direct_message_events) {
  
//       // loop through each event
//       payload.direct_message_events.forEach(message_event => {
  
//         // check if event is a message_create event and if it is incoming by validating sender ID
//         if(message_event.type == 'message_create' && message_event.message_create.sender_id != TWITTER_USER_ID) {
          
//           // process each event individually
// 		    message_data=message_event.message_create.message_data;
// 		    // check for quick reply response
// 		    if(message_event.message_create.message_data.quick_reply_response) {
// 		      // access the metadata of the quick reply response
// 		      metadata = message_event.message_create.message_data.quick_reply_response.metadata
// 		    }
// 		    // user submitted free form messsage
// 		    else {
// 		      metadata = 'default_message' 
// 		    }

// 		    // access sender of the message to reply to
// 		    sender_id = message_event.message_create.sender_id
//         }
//       });

//       response = {
// 	      "event": {
// 	        "type": "message_create",
// 	        "message_create": {
// 	          "target": {
// 	            "recipient_id": undefined
// 	          },
// 	          "message_data": {
// 	            "text": undefined,
// 	          }
// 	        }
// 	      }
// 	    }
	  
// 	    msg.event.message_create.target.recipient_id = recipient_id;
// 	    msg.event.message_create.message_data.text = message_data;


// 	    // request options
// 	    var request_options = {
// 	      url: 'https://api.twitter.com/1.1/direct_messages/events/new.json',
// 	      oauth: oauth,
// 	      json: true,
// 	      headers: {
// 	        'content-type': 'application/json'
// 	      },
// 	      body: response
// 	    }

// 	    // POST request to send Direct Message
// 	    request.post(request_options, function (error, response, body) {
// 	      console.log(body)
// 	    })
//     }
// });

// // app.get('/', (req, res) => {
// //   console.log("Hello World");
// //   console.log(req.body);
// // });
app.use('/callbacks/addsub',(req,res,next)=>{
    console.log("Call back recieved");
})

app.use('/callbacks/removesub',(req,res,next)=>{
    console.log("Call back recieved");
})

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});