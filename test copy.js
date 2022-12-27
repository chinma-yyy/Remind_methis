const { TwitterApi } = require('twitter-api-v2');
const client = new TwitterApi({ clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET });
const Admin = require('./models/admin');
async function main() {
    const userDoc = await Admin.findOne({ user: 'All details' });
    const pRefreshToken = userDoc.oauth_refresh_token;
    const pAccesstoken = userDoc.oauth_acces_token;
    const pCodeVerifier = userDoc.oauth_codeVerfier;
    const pCode = userDoc.oauth_code;
    return pRefreshToken;
}

try {
    // const { url, codeVerifier, state } = client.generateOAuth2AuthLink(process.env.CALLBACK_URL, { scope: ['tweet.read', 'users.read', 'offline.access', 'dm.read','dm.write'] });
    // // let codeVerifier=process.env.CODEVERIFIER;
    // let code=process.env.CODE;
    client.currentUserV2().sendDmToParticipant(process.env.USER_ID, {
        text: 'Direct login',
    }).then((result) => {
        console.log(result);
        console.log("Message sent")
    }).catch((err) => { console.log(err) });
    // client.loginWithOAuth2({ pCode, pCodeVerifier, redirectUri: process.env.CALLBACK_URL })
    //     .then(async ({ client: loggedClient, accessToken, refreshToken, expiresIn }) => {
    //         const { dm_conversation_id, dm_event_id } = await loggedClient.v2.sendDmToParticipant(process.env.USER_ID, {
    //             text: 'Direct login',
    //         })
    //         const newRefreshToken = refreshToken;
    //         const newAccessToken = accessToken;
    //         //update it in database
    //         Admin.updateOne({user:'All details'}, {oauth_acces_token:newAccessToken,oauth_refresh_token:newRefreshToken}).then((result)=>{
    //             console.log("updated");
    //         }).catch((err)=>{
    //             console.log(err);
    //         })


    //     })
    //     .catch(() => res.status(403).send('Invalid verifier or access tokens!'));
}
catch (err) {
    pRefreshToken = main();
    const { client: refreshedClient, accessToken, refreshToken: newRefreshToken } = client.refreshOAuth2Token(pRefreshToken).then(result => {
        const { dm_conversation_id, dm_event_id } = refreshedClient.v2.sendDmToParticipant(process.env.USER_ID, {
            text: 'Refresh message',
        })
    }).then(res => { console.log("message sent") }).catch((err) => { console.log(err) });
    // const newAdmin = new Admin({
    //     user: "New user",
    //     oauth_acces_token: accessToken,
    //     oauth_refresh_token: newRefreshToken,
    //     oauth_codeVerfier: "kuchh fayda"
    // });
    // newAdmin.save();

    console.log("nahi hua");
}



