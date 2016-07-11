let strings = require('./strings');

// keyboards

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

let helpKeyboard = [
	[
		{ 
			text: '@borodutch',
			url: 'http://telegram.me/borodutch' 
		}
	]
];

let languageKeyboard = [
	[
		{ 
			text: '🇷🇺',
			callback_data: 'russian' 
		},
		{ 
			text: '🇺🇸',
			callback_data: 'english' 
		}
	]
];

// functions

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

function sendInline(bot, chatId, text, keyboard) {
	var message = {
		chat_id: chatId,
		text: text,
		reply_markup: {
			inline_keyboard: keyboard
		}
	}
	message.reply_markup = JSON.stringify(message.reply_markup);
	bot.sendMessage(message)
	.catch(err => console.log(err));
};

// exports

module.exports = {
	// keyboards
	mainMenuKeyboard: mainMenuKeyboard,
	helpKeyboard: helpKeyboard,
	languageKeyboard: languageKeyboard,
	// functions
	sendKeyboard: sendKeyboard,
	sendInline: sendInline
};