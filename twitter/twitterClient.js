const {TwitterApi}=require('twitter-api-v2');

const client = new TwitterApi('bearerToken');


const { dm_conversation_id, dm_event_id } = await client.v2.sendDmToParticipant('12', {
	text: 'Hello!',
	attachments: [{ media_id: '123' }],
})