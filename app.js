//All packages
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const { TwitterApi } = require('twitter-api-v2');
//All models
const User = require('./models/user');
const Admin = require('./models/admin');
const Tweet = require('./models/tweet');
//All routes
const appRoutes = require('./routes/appRoutes');
const userRoutes = require('./routes/userRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const saveRoutes = require('./routes/saveRoutes');
const CronJob = require('cron').CronJob;

async function sendDM(message, userId) {
  const userDoc = await Admin.findOne({ user: 'All details' });
  //retrieve tokens from db
  const pRefreshToken = userDoc.oauth_refresh_token;
  const pAccesstoken = userDoc.oauth_acces_token;

  try {
    const v2client = new TwitterApi(pAccesstoken);//create client with access token as bearer token
    const sent1 = await v2client.v2.sendDmToParticipant(userId, {
      text: message,
    }).then(result => {
      console.log("message sent");
    }
    );
    //If token expires renew in catch block and send DIrect message
  }
  catch (err) {
    const v2client = new TwitterApi({ clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET });//Client using developer keys
    let refreshToken;
    let accessToken;
    try {
      const refresh = await v2client.refreshOAuth2Token(pRefreshToken)//Refresh the token
        .then(obj => {
          let body = JSON.stringify(obj);//JSON obj ko string karke firse json to acces it
          let json = JSON.parse(body);
          refreshToken = json.refreshToken;
          accessToken = json.accessToken;
        });

      const refreshedClient = new TwitterApi(accessToken);//New client on new tokens
      const userDoc = Admin.updateOne({ user: 'All details' }, { oauth_acces_token: accessToken, oauth_refresh_token: refreshToken })//Update the Tokens in db
        .then(obj => {
          console.log("updated succesfully");
        })
        .catch(err => { console.log(err) });
      const sent2 = refreshedClient.v2.sendDmToParticipant(userId, {
        text: message,
      }).then(obj => { console.log("Message sent") })//Send dm from new refreshed client
        .catch(err => {
          console.log(err);
        });

    }
    catch (err) {
      console.log("Main client error");//Kuchh toh jhol hai bahut bada
      console.log(err);
    }
  }

}

const job = new CronJob('0 */1 * * * *', function () {
  const d = new Date();
  const now = Date.parse(d);
  const remind = Tweet.find({ remindFlag: true }).then(tweets => {
    for (i = 0; i < tweets.length; i++) {
      const comp = Date.parse(tweets[i].remindTime);
      if (d > comp) {
        sendDM(tweets[i].tweetURL, tweets[i].userId);
        Tweet.updateOne({tweetURL:tweets[i].tweetURL},{remindFlag:false}).then(result=>{
        })
      }
    }
  });
}

)
job.start();




app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Handle CRC request response from twitter
app.use('/webhook', webhookRoutes)
app.use('/app', appRoutes);
app.use('/user', userRoutes);
app.get('/save', async (req, res, next) => {
  const userId = req.query.userId;
  const tweetURL = req.query.tweet;
  let tag;
  if (req.query.tag) {
    tag = req.query.tag;
    const update = await User.updateOne({ userId: userId }, { $addToSet: { tags: tag } }).then(result => {
      console.log("updated succesfully");//Add tags to user data
    })
  }
  else {
    tag = 'none';
  }
  const newTweet = new Tweet({
    userId: userId,
    tweetURL: tweetURL,
    remindFlag: false,
    tags: tag,
  });
  newTweet.save();
  res.json({ message: "tweet saved" });

});

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