
const reminderSet=(date)=>{
    const messages=[
        "I will remind you read this tweet around "+date,
        "I have recieved your reminder I'll remind you at "+date,
        "I have to remind you at "+date+" right?"
    ]
    const message=messages[Math.floor(Math.random() * 2)];
    console.log(message);
    return message;
}
const reminderSend=()=>{
    const messages=[
        "Hey, here is your tweet you had to read!!✌️ ",
        "Make sure to read this tweet as I have marked it as read for you😉",
        "I know you are busy but take some time to read this tweet you asked me to remind of😁",
        "Here is your reminder to read this tweet 📖",
        "⏰⏰⏰ Reminder to read this tweet ⏰⏰⏰",
        "Don't forget to read this tweet 🙌"
    ]
    const message=messages[Math.floor(Math.random() * 5)];
    console.log(message);
    return message;
}

const saved=()=>{
    const messages=[
        "I have saved your tweet ;)",
        "Your tweet has been saved.",
        "Oh!! I have saved this IMP tweet for you😂",
        "I am here for you. I have saved it✅"
    ]
    const message=messages[Math.floor(Math.random() * 3)];
    console.log(message);
    return message;

}

const connected=()=>{
    const messages=[
        "Already connected? How IDK?🤣🤣",
        "Maybe my server is faster than Twitter's😉. You are already connected to me.",
        "Kitne baar connect karega",
        "Oh I already have your data 🤷‍♂️"
    ]
    const message=messages[Math.floor(Math.random() * 3)];
    console.log(message);
    return message;
}

module.exports={
    saved,
    connected,
    reminderSend,
    reminderSet
}