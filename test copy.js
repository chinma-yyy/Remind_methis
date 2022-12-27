const { TwitterApi } = require('twitter-api-v2');
const client = new TwitterApi({ clientId: process.env.CLIENT_ID, clientSecret: process.env.CLIENT_SECRET });

const Admin=require('./models/admin');

try {
    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(process.env.CALLBACK_URL, { scope: ['tweet.read', 'users.read', 'offline.access', 'dm.read','dm.write'] });
    // let codeVerifier=process.env.CODEVERIFIER;
    let code=process.env.CODE;
    const userDoc=Admin.findOne({user:'All details'})
    client.loginWithOAuth2({ code, codeVerifier, redirectUri: process.env.CALLBACK_URL })
        .then(async ({ client: loggedClient, accessToken, refreshToken, expiresIn }) => {
            const { dm_conversation_id, dm_event_id } =  loggedClient.v2.sendDmToParticipant(process.env.USER_ID, {
                text: 'Direct login',
            })
            const newRefreshToken = refreshToken;
            const newAccessToken=accessToken;
            //u


        })
        .catch(() => res.status(403).send('Invalid verifier or access tokens!'));
}
catch (err) {
    const { client: refreshedClient, accessToken, refreshToken: newRefreshToken } = await client.refreshOAuth2Token(pRefreshToken);
    const newAdmin = new Admin({
        user: "New user",
        oauth_acces_token: accessToken,
        oauth_refresh_token: newRefreshToken,
        oauth_codeVerfier: "kuchh fayda"
    });
    newAdmin.save();
    const { dm_conversation_id, dm_event_id } = await refreshedClient.v2.sendDmToParticipant(process.env.USER_ID, {
        text: 'Refresh message',
    })
}


