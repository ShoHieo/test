// Import Packages
const express  = require('express');
const line     = require('@line/bot-sdk');
const portNum  = 3000;

// Import self-made module
const smallTalk = require('./modules/smallTalk');
// const glitchCharArray  = require('./modules/glitchChar');
// const glitchImageArray = require('./modules/glitchImage');

// Start up express server
const app = express();
app.listen(portNum, () => {
  console.log('サーバ起動');
});

// API key for the LINE BOT, issue a new one on production and set the values to be environment variables
const lineConfig = {
  channelSecret: '5caa2322fa471a56428048cadb487d38',
  channelAccessToken: 'vBBSgA+Ijo60Htb6zauIQajO/sXrEho42rDcBORX4pGYPivk0vEENbtORg1nKy+FW1Jb9uxbqynJyDq4hFhGddCZWB0s4VIWN0PXEknKCe8uCgAioyjBsEWwzyHwMj0WHffOYVKHDjQkJ5g+QKNQrQdB04t89/1O/w1cDnyilFU='
//アクセストークンは失効時間があるため変更する
};

const client = new line.Client(lineConfig);

// Routing for the linebot webhook
app.post('/webhook', line.middleware(lineConfig), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
});

// Hold user id and glitch level(increases as users talks with bot)
// The higher the userGlitchLevel, the buggier the text becomes
var userGlitchLevel = {};

// LINE BOT LOGIC
function handleEvent(event){
  const userId = event.source.userId;

  // When a user adds bot as a friend or unblocks the bot
  if(event.type === 'follow'){
    const greetText = '友達追加ありがとう！　何か発言してね！';
    return client.replyMessage(event.replyToken, replyText(userId, greetText));
  }

　// When a user sends a text message to the bot
  if(event.message.type === 'text'){
    const userText = event.message.text; // text of user's message

  //if(userText === 'モニター'){
      //return client.replyMessage(event.replyToken, {
        //type: 'flex',
        //altText: 'モニター',
        //contents: {
          //type: 'bubble',
          //header: {
            //type: 'box',
            //layout: 'vertical',
            //contents: [{
              //type: 'text',
              //text: 'モニター',
              //weight: 'bold',
              //align: 'center'
            //}]
          //},
          //hero: {
            //type: 'image',
            //url: glitchImageArray[getGlitchLevel(userId)][Math.floor(Math.random() * glitchImageArray[getGlitchLevel(userId)].length)],
            //size: 'full',
            //aspectRatio: '1:1',
            //aspectMode: 'cover'
          //},
          //footer: {
            //type: 'box',
            //layout: 'vertical',
            //contents: [{
              //type: 'text',
              //text: 'Source: http://seiga.nicovideo.jp/seiga/im4937714',
              //color: '#aaaaaa',
              //size: 'xxs'
            //}]
          //}
        //}
      //});
    //}


//if(userText === 'あいうえお'){
//message = {
  //"type": "template",
//"altText": "this is a confirm template",
//"template": {
  //"type": "confirm",
  //"text": "Are you sure?",
  //"actions": [
    //  {
      //  "type": "message",
        //"label": "Yes",
        //"text": "yes"
      //},
      //{
        //"type": "message",
        //"label": "No",
        //"text": "no"
      //}
      //]
    //}
  //};
//}



　　if(userText === 'git'){
      const resetText = 'https://github.com/verhichi/glitchBot';
      return client.replyMessage(event.replyToken, replyText(userId, resetText));
    }


    if(userText === 'リセット'){
      userGlitchLevel[userId] = 0;
      const resetText = 'あ、なんか直った...?\n';
      return client.replyMessage(event.replyToken, replyText(userId, resetText));
    }

    // Set glitch Level
    addGlitchLevel(userId);

    if(getGlitchLevel(userId) < 9){
      // Send user text to smallTalk API to get response
      smallTalk(userText)
        .then((smallTalkResponse) => {
          return client.replyMessage(event.replyToken, replyText(userId, smallTalkResponse));
        })
        .catch((err) => {
          console.error(err);
          return client.replyMessage(event.replyToken, {
            type: 'text',
            text: 'すみません、もう一度入力してください'
          });
        });
    } else {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'すみません、もう一度入力してください'
      });
    }
  } else {
    return Promise.resolve(null);
  }
}


// General function to return text object
function replyText(userId, text){
  const returnText = glitchifyText(userId, text);
  //return {
    //type: 'text',
    //text: returnText
//   , quickReply: { //ボタン
//      items:[
//        {
//          type: 'action',
//          action: {
//            type: 'message',
//            label: 'モニターを見る',
//            text: 'モニター'
//          }
//        }
//      ]
//    }
  //};
 }

// Set user's glitch Level(add to userId key if not yet defined)
// 25% chance for glitch level to increase
function addGlitchLevel(userId){
  if(Math.random() <= 0.25){
    if(userGlitchLevel[userId] < 9){
      userGlitchLevel[userId]++;
    }else{
      userGlitchLevel[userId] = 1;
    }
  }
}

// Get user's glitch level(0 if not yet defined)
function getGlitchLevel(userId){
  return userGlitchLevel[userId] || 0;
}


// Glitch bot response based on user's glitch Level
function glitchifyText(userId, text){
  let returnTextArray = text.split('');
  // Replace glitchLevel amount of random character's with random glitchChar from glitchCharArray glitchCharArrayをランダムに置き換える
  //for(let count = 0; count < getGlitchLevel(userId); count++){
    //const glitchChar = glitchCharArray[Math.floor(Math.random() * glitchCharArray.length)];
    //returnTextArray[Math.floor(Math.random() * returnTextArray.length)] = glitchChar;
  //}
  return returnTextArray.join('');
}
