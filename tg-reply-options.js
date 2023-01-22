module.exports = {

    startOptions: {
        disable_notification: true, reply_markup: JSON.stringify({
            inline_keyboard: [[{text: 'Generate a small image', callback_data: '/createsmall'}], [{
                text: 'Generate a medium image',
                callback_data: '/createmedium'
            }], [{text: 'Generate a large image', callback_data: '/createlarge'}]]
        })
    },

}
