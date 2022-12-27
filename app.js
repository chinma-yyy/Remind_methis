const express = require('express');
const crypto = require('crypto');
const request = require('request');
const mongoose = require('mongoose');
const app = express();
const { TwitterApi } = require('twitter-api-v2');
const User = require('./models/user');
const Admin=require('./models/admin');

const appRoutes = require('./routes/appRoutes');
const userRoutes = require('./routes/userRoutes');


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
});



app.use('/app', appRoutes);
app.use('/user', userRoutes);

app.get('/callback', async (req, res) => {
  // Extract state and code from query string
  const state = req.query.state;
  const code = req.query.code;
  console.log("state-"+state);
  console.log("code-"+code);
  // Get the saved codeVerifier from session
  // const { codeVerifier, state: sessionState } = req.session;
  let codeVerifier='9x6UHj1Aj03vfB4mBoPMaA-qlvftiJsM.hxoliy3FsvCqv6o.SvIHIuQy2-tNuK289gm8Iq5-77TA_A4h7Vw7D3w1aYoMkHLITFy7Ovlrn-b4_26FoSHqlYdz6AcahkK';
  
  
  console.log("verifier-"+codeVerifier);
  if (!codeVerifier || !state ||  !code) {
    return res.status(400).send('You denied the app or your session expired!');
  }
  // if (state !== sessionState) {
  //   return res.status(400).send('Stored tokens didnt match!');
  // }

  // Obtain access token
  const client = new TwitterApi({ clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET });

  client.loginWithOAuth2({ code, codeVerifier, redirectUri: process.env.CALLBACK_URL })
    .then(async ({ client: loggedClient, accessToken, refreshToken, expiresIn }) => {
      const { dm_conversation_id, dm_event_id } = await loggedClient.v2.sendDmToParticipant(process.env.USER_ID, {
        text: 'Testing!',
      })
      const freshToken=refreshToken;
      const adminUser=new Admin({
        user:'All details',
        oauth_state:state,
        oauth_codeVerifier:codeVerifier,
        oauth_refresh_token:freshToken,
        oauth_access_token:accessToken,
        expiresIn:expiresIn
      })
      adminUser.save();
      
      // {loggedClient} is an authenticated client in behalf of some user
      // Store {accessToken} somewhere, it will be valid until {expiresIn} is hit.
      // If you want to refresh your token later, store {refreshToken} (it is present if 'offline.access' has been given as scope)

      // Example request
      // const { data: userObject } = await loggedClient.v2.me();
    })
    .catch(() => res.status(403).send('Invalid verifier or access tokens!'));
});

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