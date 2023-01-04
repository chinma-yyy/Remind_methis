const Admin=require('../models/admin');
const {TwitterApi}=require('twitter-api-v2');


exports.sendDM = async (message, userId)=> {
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