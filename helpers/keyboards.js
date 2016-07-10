let strings = require('./strings');

// Keyboards

let mainMenuKeyboard = [
	[
		{
			text: strings.mainMenuOptions.findJobs
		},
		{
			text: strings.mainMenuOptions.findContractors
		}
	],
	[
		{
			text: strings.mainMenuOptions.changeLanguage
		},
		{
			text: strings.mainMenuOptions.help
		}
	]
];

// Functions

function sendKeyboard(bot, chatId, text, keyboard) {
	var message = {
		chat_id: chatId,
		text: text,
		reply_markup: {
			keyboard: keyboard,
			resize_keyboard: true
		}
	}
	message.reply_markup = JSON.stringify(message.reply_markup);
	bot.sendMessage(message)
	.catch(err => console.log(err));
};

module.exports = {
	// Keyboards
	mainMenuKeyboard: mainMenuKeyboard,
	// Functions
	sendKeyboard: sendKeyboard
};