from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
import requests 
from bs4 import BeautifulSoup 
import time
import telebot 
from telebot import types
import json
import datetime
import os
from dotenv import load_dotenv

load_dotenv()
TOKEN=os.getenv("TOKEN")
URL_GET_OHLC=os.getenv("URL_GET_OHLC")
URL_GETCOIN=os.getenv("URL_GETCOIN")
def menu(message):
     markup = types.InlineKeyboardButton(row_width=2)
     one = types.InlineKeyboardButton('Vu',callback_data='answer1')
     tw0 = types.InlineKeyboardButton('Vu',callback_data='answer')
     three= types.InlineKeyboardButton('Vu',callback_data='answer2')
     fore= types.InlineKeyboardButton('Vu',callback_data='answer3')
     markup.add(one,tw0,three,fore)
     app.send_message(message.chart.id,'Can i help you',reply_markup=markup)
     
def get_real_time():
    current_time = datetime.datetime.now()
    epoch_timestamp = int(current_time.timestamp())
    unix_timestamp = int(epoch_timestamp * 1000)
    return unix_timestamp
def ohlvc():
    last3days=get_real_time()-259200000
    after= str(last3days)
    url = URL_GET_OHLC + after
    response = requests.request("GET", url )
    response=response.json()
    a= response["data"]
    a.sort(reverse = False)
    b = [[eval(x) for x in list] for list in a]
    return print(b)
def access_url():
    access = [] 
    url='https://www.okx.com/markets/prices'
    a = requests.get(url)
    html_content = a.text.encode('utf-8')
    soup = BeautifulSoup(html_content,"html.parser")
    mydiv = soup.find_all('td',{'class':'name token-info'})
    for x in mydiv:
            url_full='https://www.okx.com'+ x.a.get('href')
            print(url_full)
    return access
def getfullname():
    title = [] 
    url='https://www.okx.com/markets/prices'
    a = requests.get(url)
    html_content = a.text.encode('utf-8')
    soup = BeautifulSoup(html_content,"html.parser")
    mydiv = soup.find_all('span',{'class':'full-name'})
    for x in mydiv:
        title.append(x.text)
    return title
def getname():
    title = [] 
    url='https://www.okx.com/markets/prices'
    a = requests.get(url)
    html_content = a.text.encode('utf-8')
    soup = BeautifulSoup(html_content,"html.parser")
    mydiv = soup.find_all('span',{'class':'short-name'})
    for x in mydiv:
        title.append(x.text)
    return title
def coin():
    url = URL_GETCOIN
    response = requests.request("GET", url)
    response=response.json()
    a= response["data"]
    b=a["spot"]
    first_ten_coins = []
    for i in range(10):
      first_ten_coins.append(b[i])
    for i in range(len(first_ten_coins)):
      first_ten_coins[i] =  "/" + first_ten_coins[i]
    return print(first_ten_coins)
async def url(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    data = getfullname()
    for y in data:
        await update.message.reply_text(f'g {y}')
async def hello(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(f'Hello {update.effective_user.first_name}')
async def btc(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    x= ohlvc()
    await update.message.reply_text(f' Last 3days g : {x}')
async def help(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    x=coin()
    a= print(x)
    await update.message.reply_text(f'COIN :{a} to see more data')
app = ApplicationBuilder().token(f'{TOKEN}').build()
app.add_handler(CommandHandler("hello", hello))
app.add_handler(CommandHandler("link", url))
app.add_handler(CommandHandler("help", help))
app.add_handler(CommandHandler("btc", btc))
x= coin()
for i in x:    
    app.add_handler(CommandHandler("{i}",i))
app.run_polling()