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
const webhookRoutes=require('./routes/webhookRoutes');


var count = 0;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Handle CRC request response from twitter
app.use('/webhook',webhookRoutes)






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