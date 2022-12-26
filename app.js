const express = require('express');
const crypto = require('crypto');
const request = require('request');
const mongoose = require('mongoose');
const app = express();

const appRoutes=require('./routes/appRoutes');
const userRoutes=require('./routes/userRoutes');


var count = 0;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Handle CRC request response from twitter
app.get('/webhook', function (req, res) {
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
});

//Handle all the events recievd to the webhooks
app.post('/webhook', (req, res, next) => {
  count = count + 1;
  var body = req.body; //store the body
  if (body.direct_message_events) {
    let message_data = body.direct_message_events[0].message_create.message_data.text;//storing the message text using json sent by twitter
    let userId=body.direct_message_events[0].message_create.sender_id;;//Storing the userId of the user doing the event
    const messageArray = message_data.split(" ");//splitting the dm to understand the time format
    if (messageArray.length > 1) {
      var num = messageArray[0];
      var time = messageArray[1];
      var link = messageArray[2];
      res.body.text=message_data;
      res.body.userId=userId;
      res.redirect('/app/dm');
    }
    else{

    }

    console.log("Start");
    // console.log(body);
    // console.log(event);
    // console.log(eventType);
    console.log(message_data);
    console.log("--------");
    console.log(count);
  }
});



app.use('/app', appRoutes);
app.use('/user', userRoutes);

app.use('/callbacks/addsub', (req, res, next) => {
  console.log("Call back recieved");
})

app.use('/callbacks/removesub', (req, res, next) => {
  console.log("Call back recieved");
})

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    process.env.MONGODB_URL
  )
  .then(result => {
    app.listen(3000);
    console.log("Server is running on port 3000")
  })
  .catch(err => console.log(err));