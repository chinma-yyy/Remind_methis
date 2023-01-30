//All packages
const { TwitterApi } = require('twitter-api-v2');
const chrono = require('chrono-node');
const crypto = require('crypto');
//All models
const Admin = require('../models/admin');
const Tweet = require('../models/tweet');
const User = require('../models/user');

const DM = require('./sendDMcontroller');
const save = require('./saveController');
const { saved, reminderSet, connected } = require('./messageController');


//Twitter will give crc token hash map it with your consumer secret and then send it in json response to verify
//twitter verifies this every 24 hours to set the webhook as active
//Status code 200 should also be set
exports.get = (req, res, next) => {

    var crc_token = req.query.crc_token;
    // console.log(crc_token);
    if (crc_token) {
        var hash = crypto.createHmac('sha256', process.env.CONSUMER_SECRET).update(crc_token).digest('base64');

        res.status(200);
        var response_token = 'sha256=' + hash;
        console.log(response_token);
        var json = {
            "response_token": response_token
        }
        // console.log(json);

        res.json({
            "response_token": response_token
        })
    } else {
        res.status(400);
        res.send('Error: crc_token missing from request.')
    }

}

//Handle all the events sent on the webhook
exports.post = async (req, res, next) => {
    var body = req.body;
  console.log("Req started");
  // console.log(body);
  //store the body of the request
  // res.json({message:"Body check"});
  if (body.direct_message_events) {
    let senderId = body.direct_message_events[0].message_create.sender_id;
    if (senderId != process.env.USER_ID) {//Khudka event ko case mei na lena
      mongoose.set('strictQuery', true);
      const client = mongoose.connect(process.env.MONGODB_URL).then(result => {
        console.log("Connected to db");
      });

      let message_data = body.direct_message_events[0].message_create.message_data.text;//storing the message text using json sent by twitter
      let urls = body.direct_message_events[0].message_create.message_data.entities.urls;//Url array with short url expanded url display url 
      let hashtags = body.direct_message_events[0].message_create.message_data.entities.hashtags;//Array of all the hashtags and their indices in the text
      let htLenght = hashtags.length;
      //Format the message
      message_data = message_data.trimStart();
      message_data = message_data.toLowerCase();
      message_data = message_data.trimEnd();

      console.log("message ="+message_data);

      //Check if user nahi hai toh create
      const search = await User.findOne({ userId: senderId }).then(userDoc => {
        if (!userDoc) {
          const client = new TwitterApi(process.env.BEARER_TOKEN);
          const userinfo = client.v2.user(senderId, { 'user.fields': ['profile_image_url', 'username', 'name'] }).then(user => {
            const string = JSON.stringify(user);
            const parse = JSON.parse(string);
            let pf_url = parse.data.profile_image_url;
            let name = parse.data.name;
            let username = parse.data.username;
            let token = crypto.randomBytes(6).toString('hex');
            const newUser = new User({
              username: username,
              name: name,
              userId: senderId,
              pf_Url: pf_url,
              token: token
            })
            newUser.save().then(result => { console.log("user saved"); });
          }
          );
        }
      }).catch(err => { console.log(err); })

      //Command handling by the bot
      if (message_data == 'reminders') {
        //send recent 5 tweets with reminder flag on
        const dbLook = await User.findOne({ userId: senderId }).then(userDoc => {
          return userDoc._id;
        }).then(Id => {
          const tweets = Tweet.find({ userId: Id, remindFlag: true }).sort({ remindTime: -1 }).then(doc => {
            if (doc == []) {
              return DM.sendDM("Pehle kuchh bhej toh reminder set karne ko", senderId);//If no reminders set
            }
            sendDM("Here are your recent reminders", senderId);
            for (i = 0; i < doc.length; i++) {
              DM.sendDM(doc[i].tweetURL, senderId);
            }
            console.log("Reminders request End");
            res.status(200).json({
              message: "Reminders sent"
            })
          }).catch(err => {
            console.log(err);
          });
        });

      }
      //Check if there is date time present in the text
      else if (chrono.parseDate(message_data)) {
        //Check if there are url present in the text
        if (urls.length) {
          const dateTime = chrono.parseDate(message_data).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });//Local date string
          const dt = chrono.parseDate(message_data);//Date time object in default tomezone

          //Check if there are tags for the tweet
          DM.sendDM(reminderSet(dateTime), senderId);
          const tags = [];
          for (i = 0; i < htLenght; i++) {
            console.log(hashtags[i].text);
            tags.push(hashtags[i].text);
          }
          console.log(tags);
          if (tags.length) {
            const update = User.updateOne({ userId: senderId }, { $addToSet: { tags: tags } }).then(result => { console.log(result); });//Add tags to the user without duplicating
          }
          save.saveTweet(senderId, urls[0].expanded_url, dt, true, tags);
          console.log("Reminder set req end");
          res.status(200).json({
            message: "Reminder Set"
          })
        }
      }
      else if (urls.length) {
        const tags = [];
        for (i = 0; i < htLenght; i++) {
          console.log(hashtags[i].text);
          tags.push(hashtags[i].text);
        }
        save.saveTweet(senderId, urls[0].expanded_url, false, false, tags);
        DM.sendDM(saved(), senderId);
        console.log("Tweet save req end");
        res.status(200).json({
          message: "Tweet saved"
        })
      }
      else if (message_data == 'connect') {
        const connection = User.findOne({ userId: senderId }).then(userDoc => {
          if (userDoc) {
            DM.sendDM(connected(), senderId);
            console.log("Connect req end");
            res.status(200).json({ mesaage: "Already connected" });
          }
          else {
            DM.sendDM("Connected😊", senderId);
            console.log("Connected req end");
            res.json({ message: "Connected" });
          }
        })
        //Aur kuchh acche se daalde for first message
      }
      else {
        DM.sendDM("Samajh nahi aaya bhai kya bol raha hai.!!! ", senderId);
        //Invalid text recieved
        setTimeout(function(){
          console.log("callback")
        },10000);
        res.status(200).json({ message: "Invalid message" });
      }
    }
    else{
      console.log("Self created message");
      res.status(200).json({
        message:"Self created"
      })
    }
  }
  else {
    console.log("Other events");
    res.status(200).json({ message: "Message event not created" });
  }
}