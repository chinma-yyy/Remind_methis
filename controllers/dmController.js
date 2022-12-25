var request = require('request');

var options = {
  'method': 'POST',
  'url': 'https://api.twitter.com/2/dm_conversations/with/1561081114306813952/messages',
  'headers': {
    'Authorization': 'Bearer X0xPQ1Vsc1BFQ1RTUEVMZjE1VC14UHF2bzlXSkN0bWRycC11WFBybzZTSWJrOjE2NzE4MTE2OTE2MzI6MToxOmF0OjE',
    'Content-Type': 'application/json',
    'Cookie': 'guest_id=v1%3A167024416675134414; guest_id_ads=v1%3A167024416675134414; guest_id_marketing=v1%3A167024416675134414; personalization_id="v1_OspHE1Mn2J48AHWi3fniWA=="'
  },
  body: JSON.stringify({
    "text": "Testing"
  })

};
request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log(response.body);
});