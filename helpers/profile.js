const dbmanager = require('./dbmanager');
const strings = require('./strings');
const keyboards = require('./keyboards');

/**
 * Sends message to user asking for bio and adds relevant flags to user's object
 * @param  {Telegram:Message} msg Message received
 * @param  {Telegram:Bot} bot Bot that should respond
 */
function askForBio(msg, bot) {
    dbmanager.findUser({ id: msg.chat.id })
    .then(user => {
        user.input_state = strings.inputBioState;
        user.save()
        .then(user => {
            let message = user.bio ?
            strings.editBioMessage+'\n\n'+strings.yourCurrentBio+'\n\n'+user.bio :
                strings.editBioMessage;
            bot.sendMessage(msg.chat.id, message, {
                reply_markup: JSON.stringify({
                    keyboard: [[ strings.cancel ]],
                    resize_keyboard: true
                }),
                disable_web_page_preview: 'true'
            }).catch(err => console.error(err.message));
        });
    });
}

eventEmitter.on(strings.inputBioState, ({ msg, user, bot }) => {
    let newBio = msg.text.substring(0, 150);

    let needsCongrats = !user.bio && !!user.hourly_rate && user.categories.length > 0;

    user.bio = newBio;
    user.input_state = undefined;
    user.save()
    .then(user => {
        bot.sendMessage(msg.chat.id, strings.changedBioMessage+user.bio, {
            reply_markup: JSON.stringify({
                keyboard: keyboards.freelancerKeyboard(user),
                resize_keyboard: true
            }),
            disable_web_page_preview: 'true'
        })
        .then(data => {
            if (needsCongrats) {
                keyboards.sendKeyboard(
                    bot,
                    user.id,
                    strings.filledEverythingMessage,
                    keyboards.freelancerKeyboard(user));
            }
        })
        .catch(err => console.error(err.message));
    });
});

eventEmitter.on('cancel' + strings.inputBioState, ({ msg, user, bot }) => {
    user.input_state = undefined;
    user.save()
    .then(user => {
        bot.sendMessage(msg.chat.id, strings.notChangedBioMessage+user.bio, {
            reply_markup: JSON.stringify({
                keyboard: keyboards.freelancerKeyboard(user),
                resize_keyboard: true
            }),
            disable_web_page_preview: 'true'
        })
        .catch(err => console.error(err.message));
    });
});

// Exports
module.exports = {
    askForBio: askForBio
};
