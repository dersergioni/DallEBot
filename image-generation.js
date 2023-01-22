const Modes = require('./session-modes');
const {getChatId, getInputData} = require('./helpers');
const {startOptions} = require('./tg-reply-options')

const {Configuration, OpenAIApi} = require('openai');

const fs = require('fs');
const path = require("path");
const https = require("https");

class ImageGeneration {

    constructor(bot, sessionModes, sessionData) {
        this.bot = bot;
        this.sessionModes = sessionModes;
        this.sessionData = sessionData;
        this.configuration = new Configuration({
            apiKey: process.env.OPENAI_API_TOKEN,
        });
        this.openai = new OpenAIApi(this.configuration);
    }

    async requestImageDescription(msg) {
        const chatId = getChatId(msg);
        const userData = this.sessionData.get(chatId);
        try {
            userData.originReq = await this.bot.sendMessage(chatId, 'Enter image description:');
            this.sessionModes.set(chatId, Modes.EnterRequest);
        } catch (e) {
            userData.originReq = await this.bot.sendMessage(chatId, 'Server error');
        }
    }

    async generateImage(msg) {
        const chatId = getChatId(msg);
        const userData = this.sessionData.get(chatId);
        try {
            const imageDesc = getInputData(msg);
            const size = userData.imageSize;
            const imageSize =
                size === 'small' ? '256x256' : size === 'medium' ? '512x512' : '1024x1024';
            const response = await this.openai.createImage({
                prompt: imageDesc,
                n: 1,
                size: imageSize,
            });
            const imageUrl = response.data.data[0].url;
            const writeStream = fs.createWriteStream(path.join('images', imageDesc + ' [' + msg.date.toString() + '].jpg'));
            https.get(imageUrl, (resp) => {
                resp.pipe(writeStream);
            });
            writeStream.on("finish", () => {
                writeStream.close();
            });
            userData.originReq = await this.bot.sendPhoto(chatId, imageUrl, startOptions);
            this.sessionModes.set(chatId, Modes.Start)

        } catch (e) {
            console.log('Exception:', e);
            userData.originReq = await this.bot.sendMessage(chatId, 'Server error');
            this.sessionModes.set(chatId, Modes.Start);
        }
    }

}

module.exports = ImageGeneration;
