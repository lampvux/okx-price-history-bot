
require("dotenv").config();
const axios = require("axios");
const functions = require("firebase-functions");
require("firebase-functions/v2/firestore");
const {initializeApp} = require("firebase-admin/app");
require("firebase-admin/firestore");
const fs = require('fs');
const path = require('path');
const express = require('express');
initializeApp();
const app = express();
app.use(express.json());
app.use(express.static('static'));
const { Telegraf } = require('telegraf');
const { text } = require("body-parser");

const token = process.env.TOKEN;
const PROJECT_ID = process.env.PROJECT_ID
const REGION = process.env.REGION



const bot = new Telegraf(token);


// Parse
const convertArray = (arr) => arr.map((innerArray) =>
  innerArray.map((item) => {
    const number = parseFloat(item);
    return isNaN(number) ? item : number;
  }),
);
let last3days = Date.now() - 259200000;
//onText bot
bot.start((ctx) => ctx.reply(`Welcome to the bot ! . /help - Show help message `));
bot.hears('hi', (ctx) => ctx.reply('Hey there'));
bot.command('sticker', ctx => ctx.reply('👋'));
bot.help((ctx) => {
  const helpMessage = `
  /start - Start the bot
  /help - Show help message
  /sticker - 👋
  /photo - test send photo
  /chart - send chart
  /price - Get price coins last 3 days
  `;
  ctx.reply(helpMessage);
});
bot.command('photo', (ctx) => {
  ctx.replyWithPhoto( { source : './image/peguin.png'}, {caption : ' This is chart of BTC'});
});
let barSize = null;
let selectedCrypto = null;
bot.command('price',(ctx)=>{
  ctx.telegram.sendMessage(ctx.chat.id,"Choose bar size  📈",
    {
      reply_markup : {
        inline_keyboard : [
          [{ text : '1m' ,callback_data : 'time_1m'},{text : '5m' ,callback_data : 'time_5m'}],
          [{ text: '1H', callback_data: 'time_1H' },{ text: '1D', callback_data: 'time_1D' }]
        ]
      }
    }
  )
})
bot.action(/time_(.+)/, (ctx) => {
  barSize = ctx.match[1]; // Extract the selected time (1m, 5m, 15m)
  ctx.reply(`You selected ${barSize}. Now select a cryptocurrency:`, {
      reply_markup: {
          inline_keyboard: [
              [{ text: 'BTC', callback_data: 'crypto_BTC' },{ text: 'ETH', callback_data: 'crypto_ETH' }],
              [{ text: 'XRP', callback_data: 'crypto_XRP' },{ text: 'OKB', callback_data: 'crypto_OKB' }]
          ]
      }
  });
});
bot.action(/crypto_(.+)/, async (ctx) => {
  selectedCrypto = ctx.match[1]; // Extract the selected cryptocurrency (BTC,ETH))
  ctx.reply(`You selected ${selectedCrypto}. Fetching data...`);

  // Fetch data based on the selections
  await fetchData(ctx, selectedCrypto, barSize);
});

// Function to fetch data from the server
const fetchData = async (ctx, crypto, bar) => {
  const url = `https://www.okx.com/api/v5/market/history-mark-price-candles?instId=${crypto}-USDT&bar=${bar}&limit=100&after=${last3days}`;
  try {
       const response = await axios.get(url)
        .then((res) => {
          const result = JSON.stringify(res.data.data);
          console.log(typeof(result));
          const dataArray = JSON.parse(result);
          const priceData = convertArray(dataArray);
          ctx.reply(`Data for ${crypto} (${bar}):\n ${priceData[0]} \n Do you want to see more 🔥 ? /price`);
          
        })
        .catch((error) => {
          ctx.reply(`can't get price of BTC ${error}`)
        });
  } catch (error) {
      ctx.reply(`Failed to fetch data from ${url}. Error: ${error.message}`);
  }
};


// // setWebhook with function 
bot.telegram.setWebhook(
  `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/echobot` 
);

exports.echobot = functions.https.onRequest(async (request, response) => {
	functions.logger.log('Incoming message', request.body)
	return await bot.handleUpdate(request.body, response).then((rv) => {
		return !rv && response.sendStatus(200)
	})
})
