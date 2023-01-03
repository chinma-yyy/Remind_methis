
# Remind_methis 

Remind_methis is a Twitter Bot to remind the user to read the tweets at a specified time by the user and also to save and view tweets with various tags to keep the resources organised.


## Deployment

The project is not yet complete. I have to create a proper frontend for the application and add some features also.


## Environment Variables

To run this project, you will need to add the following environment variables to your nodemon.json file in a json format(Template is provided)

`CONSUMER_KEY`

`CONSUMER_SECRET`

`BEARER_TOKEN`

`ACCESS_TOKEN`

`ACCESS_TOKEN_SECRET`

`CLIENT_ID`

`CLIENT_SECRET`

`MONGODB_URL`

`USER_ID`

`CALLBACK_URL`

`BASE_URL`



## Run Locally

Clone the project

```bash
  git clone https://github.com/chinmayshewale/Remind_methis
```



Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm start
```
To recieve webhook requests you must have a Twitter develepor account with elevated access which grants you for 15 free subscriptions for your webhook.

To setup your webhook and subscription you may refer to this repository : [account-activity-dashboard](https://github.com/twitterdev/account-activity-dashboard)

Make sure to update all your keys with the required permissions with read write and direct message permissions.

As mentioned in the  [Twitter documentation](https://developer.twitter.com/en/docs/twitter-api/enterprise/account-activity-api/guides/getting-started-with-webhooks) you must host your application to recieve the request.

You can use [ngrok](https://ngrok.com/) to tunnel your local host and recieve the webhook requests for development rather than hosting it.
## Tech Stack

**Client:** Twitter 

**Server:** Node, Express , MongoDB , Chrono , Twitter-API-V2 , Crypto


## Authors

- [@Chinmay Shewale](https://www.github.com/chinmayshewale)


## Contact

You can reach out to me through Twitter [chinma_yyy](https://www.twitter.com/chinma_yyy) or mail me shewalechinmay54@gmail.com.


## Acknowledgements

 - [chrono](https://github.com/wanasit/chrono)
 - [twitter-api-v2](https://github.com/plhery/node-twitter-api-v2)
 - [ngrok](https://ngrok.com/)

