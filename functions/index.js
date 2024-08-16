
require("dotenv").config();
const axios = require("axios");
const functions = require("firebase-functions");
const logger = require("firebase-functions/logger");
require("firebase-functions/v2/firestore");
const {initializeApp} = require("firebase-admin/app");
require("firebase-admin/firestore");
const token = process.env.TOKEN;
const express = require('express');
initializeApp();
const app = express();
app.use(express.json());
app.use(express.static('static'));
const { Telegraf } = require('telegraf');
const { projectID } = require("firebase-functions/params");
const bot = new Telegraf(token);

const PROJECT_ID = process.env.PROJECT_ID
const REGION = process.env.REGION


const convertArray = (arr) => arr.map((innerArray) =>
  innerArray.map((item) => {
    const number = parseFloat(item);
    return isNaN(number) ? item : number;
  }),
);
let last3days = Date.now() - 259200000;
bot.start((ctx) => ctx.reply(`Welcome to the bot ! . /help - Show help message `));
bot.hears('hi', (ctx) => ctx.reply('Hey there'));

bot.command('sticker', ctx => ctx.reply('👍'));
bot.command('BTC',  (ctx) =>{ 
  axios.get('https://www.okx.com/api/v5/market/history-mark-price-candles?instId=BTC-USDT&bar=1m&limit=100&after='+last3days)
      .then((res) => {
        const result = JSON.stringify(res.data.data);
        console.log(typeof(result));
        const dataArray = JSON.parse(result);
        const priceData = convertArray(dataArray);
        ctx.reply(`Price BTC 3 days ago : ${priceData[0]}` );
      })
      .catch((error) => {
        ctx.reply(`can't get price of BTC ${error}`)
      });


});
bot.command('hipster', Telegraf.reply('λ'));
bot.help((ctx) => {
  const helpMessage = `
  /start - Start the bot
  /help - Show help message
  /BTC - Get BTC price
  `;
  ctx.reply(helpMessage);
});
bot.telegram.setWebhook(
  `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/echobot` 
);

exports.echobot = functions.https.onRequest(async (request, response) => {
	functions.logger.log('Incoming message', request.body)
	return await bot.handleUpdate(request.body, response).then((rv) => {
		return !rv && response.sendStatus(200)
	})
})
