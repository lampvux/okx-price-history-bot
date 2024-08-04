require("dotenv").config();
const axios = require("axios");
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
require("firebase-functions/v2/firestore");
const {initializeApp} = require("firebase-admin/app");
require("firebase-admin/firestore");
const TelegramBot = require("node-telegram-bot-api");
const token = process.env.TOKEN;
const bot = new TelegramBot(token, {polling: true});
initializeApp();
require("dotenv").config();
const convertArray = (arr) => arr.map((innerArray) =>
  innerArray.map((item) => {
    const number = parseFloat(item);
    return isNaN(number) ? item : number;
  }),
);
exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});
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
        response.send(result);
      })
      .catch((error) => {
        console.log(error);
      });
});
exports.price = onRequest((request, response) => {
  logger.info("a", {structuredData: true});
  const url2 = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://www.okx.com/api/v5/market/history-mark-price-candles?instId=BTC-USDT&bar=1m&limit=100&after="+last3days,
  };
  axios.request(url2)
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
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Received your message");
});
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `Hello, ${msg.from.first_name}! Welcome to the bot. `;
  bot.sendMessage(chatId, welcomeMessage);
});
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const help = " \n/start - Start the bot\n/help-Show help message\n";
  const helpMessage = "Here are the available commands:" + help;
  bot.sendMessage(chatId, helpMessage);
});
bot.onText(/\/BTC/, (msg) => {
  const chatId = msg.chat.id;
 try {
    const CLOUD_FUNCTION_URL ='https://us-central1-okx-pricing-history-chart.cloudfunctions.net/price'
    const response = await axios.get(CLOUD_FUNCTION_URL);
    const priceData = response.data[0];
    const message = `BTC Price: ${priceData}`;
    bot.sendMessage(chatId, message);
  } catch (error) {
    bot.sendMessage(chatId, 'Error fetching BTC price.');
  }
});


bot.onText(/\/BTC/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const CLOUD_FUNCTION_URL ='https://us-central1-okx-pricing-history-chart.cloudfunctions.net/price'
    const response = await axios.get(CLOUD_FUNCTION_URL);
    const priceData = response.data[0];
    const message = `BTC Price: ${priceData}`;
    bot.sendMessage(chatId, message);
  } catch (error) {
    bot.sendMessage(chatId, 'Error fetching BTC price.');
  }
});