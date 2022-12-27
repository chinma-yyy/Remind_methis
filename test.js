// const time=new Date();
// console.log(time);
// const date=time.getTime();
// console.log(date);

// const date3 = new Date("27 July 2016 13:30:00 UTC+05:45");
// const currentDate = new Date();
// const timestamp = currentDate.getTime();

// const currentHour=currentDate.getHours();
// const currentMinutes=currentDate.getMinutes();
// const currentSeconds=currentDate.getSeconds();
// const currentDayOfMonth = currentDate.getDate();
// const currentMonth = currentDate.getMonth(); // Be careful! January is 0, not 1
// const currentYear = currentDate.getFullYear();
// const timeString= currentHour +":"+currentMinutes+":"+currentSeconds;
// const dateString = currentDayOfMonth + "-" + (currentMonth + 1) + "-" + currentYear;
// console.log(dateString);
// console.log(timeString);
// console.log(date3);

// const newTime=new Date().toLocaleTimeString();
// console.log(newTime.slice(0,8));
// let text="24  hours  https://www.twitter.com/chinma_yyy";

// var array=text.split(" ");
// var i=0;
// while(array[i]){
//     console.log(typeof array[i]);
//     console.log(array[i]);
//     i++
// }


let text="Ladies + Gentlemen";
let coded=encodeURIComponent(text);
console.log(coded);
console.log(decodeURIComponent(coded));

const consumerClient = new TwitterApi({ appKey: CONSUMER_KEY, appSecret: CONSUMER_SECRET });
// Obtain app-only client
const client = await consumerClient.appLogin();
