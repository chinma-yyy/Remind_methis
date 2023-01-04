//All packages
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const { TwitterApi } = require('twitter-api-v2');
const compression=require('compression');
//All models
const User = require('./models/user');
const Admin = require('./models/admin');
const Tweet = require('./models/tweet');
//All routes
const appRoutes = require('./routes/appRoutes');
const userRoutes = require('./routes/userRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const DM=require('./controllers/sendDMcontroller');
const CronJob = require('cron').CronJob;



const job = new CronJob('0 */1 * * * *', function () {
  const d = new Date();
  const now = Date.parse(d);
  const remind = Tweet.find({ remindFlag: true }).then(tweets => {
    console.log(tweets);
    for (i = 0; i < tweets.length; i++) {
      const comp = Date.parse(tweets[i].remindTime);
      if (d > comp) {
        DM.sendDM(tweets[i].tweetURL, tweets[i].userId);
        DM.sendDM("Make sure to read this cause i have marked it as read!",tweets[i].userId);
        Tweet.updateOne({userId:tweets[i].userId,remindTime:tweets[i].remindTime},{remindFlag:false}).then(result=>{
          console.log(result);
        })
      }
    }
  });
  console.log(".");
}

)
job.start();




app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

//Handle CRC request response from twitter
app.use('/webhook', webhookRoutes)
app.use('/app', appRoutes);
app.use('/user', userRoutes);


//Handle OAuth2 callback
app.get('/callback', async (req, res) => {
  // Extract state and code from query string
  const state = req.query.state;
  const code = req.query.code;
  console.log("state-" + state);
  console.log("code-" + code);
  //Take code verifier from first step an put it here 
  let codeVerifier = 'JAt9PkjYMDrPF5CS3eWRNSV7Jsorf4VPQ27WHD5.pQ9f8s9Fcb2-aY_jd7hJYBo-63GoTE~DcWCn5FNrDb_tsbX2sfRWrVG9j2s6dWaFKiaqVnMH~wztV-Ep7hQ8D1sD';
  console.log("verifier-" + codeVerifier);

  const client = new TwitterApi({ clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET });

  client.loginWithOAuth2({ code, codeVerifier, redirectUri: process.env.CALLBACK_URL })
    .then(async ({ client: loggedClient, accessToken, refreshToken, expiresIn }) => {
      const { dm_conversation_id, dm_event_id } = await loggedClient.v2.sendDmToParticipant(process.env.USER_ID, {
        text: 'Testing!',
      })
      const newRefreshToken = refreshToken;
      const newAccessToken = accessToken;
      const newAdmin = new Admin({
        user: 'All details',
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

//Error handler
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