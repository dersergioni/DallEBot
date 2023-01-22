module.exports = {
    getChatId(msg) {
        let chatId;
        if (msg.message_id !== undefined) {
            //Get chatId from message
            chatId = msg.chat.id;
        } else {
            //Get chatId from reply callback
            chatId = msg.message.chat.id;
        }
        return chatId;
    },

    getInputData(msg) {
        let data;
        if (msg.message_id !== undefined) {
            //Get chatId from message
            data = msg.text;
        } else {
            //Get chatId from reply callback
            data = msg.data;
        }
        return data;
    },
};
