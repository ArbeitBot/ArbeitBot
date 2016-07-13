let strings = require('./strings');

// Keyboards

let mainMenuKeyboard = [
	[{ text: strings.mainMenuOptions.findJobs },
	{ text: strings.mainMenuOptions.findContractors }],
	[{ text: strings.mainMenuOptions.help }]
];

let clientKeyboard = [
	[{ text: strings.clientMenuOptions.postNewJob }],
	[{ text: strings.clientMenuOptions.back },
	{ text: strings.clientMenuOptions.myJobs }]
];

let helpKeyboard = [
	[{	text: '@borodutch',
		url: 'http://telegram.me/borodutch'}]
];

// Functions

function freelancerKeyboard(user) {
	let bioText = (user.bio) ? 
		strings.freelanceMenuOptions.editBio :
		strings.freelanceMenuOptions.addBio;
	let categoriesText = (user.categories.length > 0) ?
		strings.freelanceMenuOptions.editCategories :
		strings.freelanceMenuOptions.addCategories;
	let hourlyRateText = (user.hourly_rate) ?
		strings.freelanceMenuOptions.editHourlyRate :
		strings.freelanceMenuOptions.addHourlyRate;
	let availableText = user.busy ?
		strings.freelanceMenuOptions.available :
		strings.freelanceMenuOptions.busy;
	return [
		[{ text: bioText },{ text: categoriesText }],
		[{ text: hourlyRateText }],
		[{ text: strings.freelanceMenuOptions.back },
		 { text: availableText }]
	];
};

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

// Exports

module.exports = {
	// Keyboards
	mainMenuKeyboard: mainMenuKeyboard,
	clientKeyboard: clientKeyboard,
	helpKeyboard: helpKeyboard,
	// Functions
	freelancerKeyboard: freelancerKeyboard,
	sendKeyboard: sendKeyboard,
	sendInline: sendInline
};