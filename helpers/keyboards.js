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

let freelanceBusyMenuKeyboard = [
	[
		{
			text: strings.freelanceMenuOptions.editBio
		},
		{
			text: strings.freelanceMenuOptions.editCategories
		}
	],
	[
		{
			text: strings.freelanceMenuOptions.editHourlyRate
		}
	],
	[
		{
			text: strings.freelanceMenuOptions.back
		},
		{
			text: strings.freelanceMenuOptions.busy
		}
	]
];

let freelanceAvailableMenuKeyboard = [
	[
		{
			text: strings.freelanceMenuOptions.editBio
		},
		{
			text: strings.freelanceMenuOptions.editCategories
		}
	],
	[
		{
			text: strings.freelanceMenuOptions.editHourlyRate
		}
	],
	[
		{
			text: strings.freelanceMenuOptions.back
		},
		{
			text: strings.freelanceMenuOptions.available
		}
	]
];

let hourlyRateKeyboard = [
	[
		{ 
			text: strings.hourlyRateOptions[0],
			callback_data: strings.hourlyRateOptions[0]
		},
		{ 
			text: strings.hourlyRateOptions[1],
			callback_data: strings.hourlyRateOptions[1]
		}
	],
	[
		{ 
			text: strings.hourlyRateOptions[2],
			callback_data: strings.hourlyRateOptions[2]
		},
		{ 
			text: strings.hourlyRateOptions[3],
			callback_data: strings.hourlyRateOptions[3]
		}
	],
	[
		{ 
			text: strings.hourlyRateOptions[4],
			callback_data: strings.hourlyRateOptions[4]
		},
		{ 
			text: strings.hourlyRateOptions[5],
			callback_data: strings.hourlyRateOptions[5]
		}
	],
	[
		{ 
			text: strings.hourlyRateOptions[6],
			callback_data: strings.hourlyRateOptions[6] 
		},
		{ 
			text: strings.hourlyRateOptions[7],
			callback_data: strings.hourlyRateOptions[7] 
		}
	],
	[
		{ 
			text: strings.hourlyRateOptions[8],
			callback_data: strings.hourlyRateOptions[8] 
		},
		{ 
			text: strings.hourlyRateOptions[9],
			callback_data: strings.hourlyRateOptions[9]
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

let helpKeyboard = [
	[
		{ 
			text: '@borodutch',
			url: 'http://telegram.me/borodutch' 
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
	freelanceBusyMenuKeyboard: freelanceBusyMenuKeyboard,
	freelanceAvailableMenuKeyboard: freelanceAvailableMenuKeyboard,
	hourlyRateKeyboard: hourlyRateKeyboard,
	languageKeyboard: languageKeyboard,
	helpKeyboard: helpKeyboard,
	// functions
	sendKeyboard: sendKeyboard,
	sendInline: sendInline
};