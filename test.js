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

// const chrono = require('chrono-node');

// let text=' 6 days from now #DSA';

// text=text.trimStart();
// console.log(text.includes("#"));

// let test1=chrono.parseDate(text).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
// let test2=chrono.parseDate(text);

// console.log(test1);
// console.log(test2);
// console.log(typeof test2);
// console.log(typeof test1);

// const { TwitterApi}=require('twitter-api-v2');


// let number=25;
// if(number%2==0){
//     console.log("Even");
// }
// else{
//     console.log("Odd");
// }
const link= fetch('https://t.co/KCsiFNFR2Y', { method: 'POST', redirect: 'follow'})
    .then(response => {
        // HTTP 301 response
        console.log(body);
    })
    .catch(function(err) {
        console.info(err + " url: " );
    });

