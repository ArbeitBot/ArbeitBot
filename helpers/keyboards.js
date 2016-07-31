/**
 * File that should handle all keyboards creations and functions (ideally)
 */

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

/**
 * Freelancer main menu keyboard; gives different keyboard depending on user's busy status, existence of bio, categories and hourly rate
 * @param  {Mongoose:User} user User object that should receive keyboard
 * @return {Telegram:Keyboard} Keyboard ready to be shown to user
 */
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

/**
 * Sends keyboard to user
 * @param  {Telegram:Bot} bot      Bot that should send keyboard
 * @param  {Number} chatId   Telegram chat id where to send keyboard
 * @param  {String} text     Text that should come along with keyboard
 * @param  {Telegram:Keyboard} keyboard Keyboard that should be sent
 * @param  {Function} then     Function that should be executed when message is delivered
 */
function sendKeyboard(bot, chatId, text, keyboard, then) {
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
	.then(then)
	.catch(err => console.log(err));
};

/**
 * Sends inline to user
 * @param  {Telegram:Bot} bot      Bot that should send inline
 * @param  {Number} chatId   Chat id where to send inline
 * @param  {String} text     Text to send along with inline
 * @param  {Telegram:Inline} keyboard Inline keyboard to send
 */
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