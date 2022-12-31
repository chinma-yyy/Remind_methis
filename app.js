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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Handle CRC request response from twitter
app.use('/webhook',webhookRoutes)
app.use('/app', appRoutes);
app.use('/user', userRoutes);

//Handle OAuth2 callback
app.get('/callback', async (req, res) => {
  // Extract state and code from query string
  const state = req.query.state;
  const code = req.query.code;
  console.log("state-"+state);
  console.log("code-"+code);
  let codeVerifier='0hpIUYpJnOCmNJIm.WAXnPYa__oX296CCPBLRwP.FQZKTibRLkAbsOC_CzgkNEm4kJxoPPtyQonDL0umbXgy_X1pOjfh.xcXrCcYyKCZCfNpv873N.4L5BPnApLHBdgx';
  console.log("verifier-"+codeVerifier);
  
  const client = new TwitterApi({ clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET });

  client.loginWithOAuth2({ code, codeVerifier, redirectUri: process.env.CALLBACK_URL })
    .then(async ({ client: loggedClient, accessToken, refreshToken, expiresIn }) => {
      const { dm_conversation_id, dm_event_id } = await loggedClient.v2.sendDmToParticipant(process.env.USER_ID, {
        text: 'Testing!',
      })
      const newRefreshToken=refreshToken;
      const newAccessToken=accessToken;
      const newAdmin = new Admin({
        user:'All details',
        oauth_acces_token: newAccessToken,
        oauth_refresh_token: newRefreshToken,
        oauth_codeVerfier: codeVerifier,
        oauth_state: state,
        oauth_code: code,
        expiresIn: expiresIn
      })
      newAdmin.save();
      console.log(newRefreshToken);
      console.log(newAccessToken);
      
    })
    .catch(() => res.status(403).send('Invalid verifier or access tokens!'));
});


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