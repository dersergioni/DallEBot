const TelegramApi = require('node-telegram-bot-api')
const Modes = require('./session-modes');
const {startOptions} = require('./tg-reply-options')
const {getChatId} = require('./helpers');
const ImageGeneration = require('./image-generation');

const token = process.env.TG_DALLE_TOKEN;
if (token === undefined) {
    console.error('Telegram token is absent');
    return;
}

const bot = new TelegramApi(token, {polling: true});
const sessionModes = new Map();
const sessionData = new Map();
const imageGeneration = new ImageGeneration(bot, sessionModes, sessionData);

const startMenu = async function (msg) {
    const chatId = getChatId(msg);
    const userData = sessionData.get(chatId);
    userData.originReq = await bot.sendMessage(chatId, 'DALL·E 2 bot welcomes you', startOptions);
    sessionModes.set(chatId, Modes.Start);
}

try {
    bot.setMyCommands([{command: '/start', description: 'Welcome'}, {
        command: '/createsmall', description: 'Generate a small image'
    }, {
        command: '/createmedium', description: 'Generate a medium image'
    }, {
        command: '/createlarge', description: 'Generate a large image'
    }]);
} catch (e) {
    console.log('Cannot set Bot MyCommand:', e);
    bot.sendMessage(chatId, 'Server error');
}

const messageCallback = async function (msg) {

    const text = msg.text;
    const chatId = getChatId(msg);
    // console.log('\n\n!message:', msg);
    // console.log('!message mode:', sessionMode);
    if (sessionData.get(chatId) === undefined) sessionData.set(chatId, {});
    const userData = sessionData.get(chatId);
    const sessionMode = sessionModes.get(chatId);

    try {
        if (sessionMode === Modes.EnterRequest) {
            await imageGeneration.generateImage(msg);
        } else if (text === '/start') {
            await startMenu(msg);
        } else if (text === '/createsmall') {
            userData.imageSize = 'small';
            await imageGeneration.requestImageDescription(msg);
        } else if (text === '/createmedium') {
            userData.imageSize = 'medium';
            await imageGeneration.requestImageDescription(msg);
        } else if (text === '/createlarge') {
            userData.imageSize = 'large';
            await imageGeneration.requestImageDescription(msg);
        } else {
            userData.originReq = await bot.sendMessage(chatId, 'Command not found');
        }
    } catch (e) {
        console.log('Exception:', e);
        userData.originReq = await bot.sendMessage(chatId, 'Server error');
    }

}

const queryCallback = async function (msg) {

    const data = msg.data;
    const chatId = getChatId(msg);
    // console.log('\n\n!callback_query:', msg.data);
    // console.log('!callback_query mode:', sessionMode);
    if (sessionData.get(chatId) === undefined) sessionData.set(chatId, {});
    const userData = sessionData.get(chatId);
    const sessionMode = sessionModes.get(chatId);

    try {
        await bot.answerCallbackQuery(msg.id);
        if (sessionMode !== undefined && msg.message.message_id !== userData.originReq?.message_id) {
            userData.originReq = await bot.sendMessage(chatId, 'Something go wrong, try again');
            return;
        }
        if (data === '/start') {
            await startMenu(msg);
        } else if (data === '/createsmall') {
            userData.imageSize = 'small';
            await imageGeneration.requestImageDescription(msg);
        } else if (data === '/createmedium') {
            userData.imageSize = 'medium';
            await imageGeneration.requestImageDescription(msg);
        } else if (data === '/createlarge') {
            userData.imageSize = 'large';
            await imageGeneration.requestImageDescription(msg);
        } else {
            userData.originReq = await bot.sendMessage(chatId, 'Command not found');
        }
    } catch (e) {
        console.log('Exception:', e);
        userData.originReq = await bot.sendMessage(chatId, 'Server error');
    }

}

bot.on('message', messageCallback);
bot.on('callback_query', queryCallback);
