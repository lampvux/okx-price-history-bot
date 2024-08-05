
require("dotenv").config();
const axios = require("axios");
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
require("firebase-functions/v2/firestore");
const {initializeApp} = require("firebase-admin/app");
require("firebase-admin/firestore");
const token = process.env.TOKEN;
const express = require('express');
const path = require("path");
const port = process.env.PORT || 3000;
initializeApp();
const app = express();
app.use(express.json());
app.use(express.static('static'));

const { Telegraf } = require('telegraf');

const bot = new Telegraf(token);

// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname + '/index.html'));
// });



const convertArray = (arr) => arr.map((innerArray) =>
  innerArray.map((item) => {
    const number = parseFloat(item);
    return isNaN(number) ? item : number;
  }),
);
const last3days = Date.now() - 259200000;
exports.coins = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  const url1 = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://www.okx.com/api/v5/rubik/stat/trading-data/support-coin",
  };
  axios.request(url1)
      .then((res) => {
        console.log(JSON.stringify(res.data.data));
        const result = JSON.stringify(res.data.data);
        response.send(result.spot);
      })
      .catch((error) => {
        console.log(error);
      });
});
exports.price = onRequest((request, response) => {
  logger.info("get price successful !", {structuredData: true});
  // bot.handleUpdate(request.body, response);
  axios.get('https://www.okx.com/api/v5/market/history-mark-price-candles?instId=BTC-USDT&bar=1m&limit=100&after='+last3days)
      .then((res) => {
        console.log(JSON.stringify(res.data.data));
        const result = JSON.stringify(res.data.data);
        console.log(typeof(result));
        const dataArray = JSON.parse(result);
        const finalResult = convertArray(dataArray);
        console.log(typeof(finalResult));
        response.send(finalResult);
      })
      .catch((error) => {
        console.log(error);
      });
});
const CLOUD_FUNCTION_URL = 'https://us-central1-okx-pricing-history-chart.cloudfunctions.net/price';
bot.start((ctx) => ctx.reply(`Welcome to the most silly bot you'll ever see`));
bot.hears('hi', (ctx) => ctx.reply('Hey there'));

bot.on('sticker', ctx => ctx.reply('👍'));
bot.command('BTC', async (ctx) =>{ 
  try {
    const response = await axios.get(CLOUD_FUNCTION_URL)
    const priceData = response.data[0];
    const message = `BTC Price: ${priceData}`;
    ctx.reply(message);
  } catch (error) {
    ctx.reply('Error fetching BTC price.');
  }
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



// bot.telegram.setWebhook(
//   `https://api.telegram.org/bot${token}/setWebhook?url=https://us-central1-okx-pricing-history-chart.cloudfunctions.net/price` //FUNCTION_TARGET is reserved Google Cloud Env
// );
// app.use(bot.webhookCallback('/price'))

bot.launch()