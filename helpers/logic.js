let strings = require('./strings');
let keyboards = require('./keyboards');
let dbmanager = require('./dbmanager');
let check = require('./messageParser');
let bot = require('./telegramBot');

// Handle messages

bot.on('message', msg => {
	if (check.botCommandStart(msg)) {
		dbmanager.addUser(msg.from, err => {
			sendMainMenu(msg.chat.id);
		});
	} else if (check.replyMarkup(msg)) {
		handleInline(msg);
	} else {
		console.log(msg);
	}
});

// Helpers

function handleInline(msg) {
	let text = msg.text;
	let mainMenuOptions = strings.mainMenuOptions;

	if (text == mainMenuOptions.findJobs) {

	} else if (text == mainMenuOptions.findContractors) {

	} else if (text == mainMenuOptions.changeLanguage) {
		sendChangeLanguage(msg.chat.id);
	} else if (text == mainMenuOptions.help) {
		sendHelp(msg.chat.id);
	}
};

// Sending messages

function sendChangeLanguage(chatId) {
	keyboards.sendInline(
		bot,
		chatId,
		strings.languageMessage,
		keyboards.languageKeyboard);
};

function sendHelp(chatId) {
	keyboards.sendInline(
		bot,
		chatId,
		strings.helpMessage,
		keyboards.helpKeyboard);
};

function sendMainMenu(chatId) {
	keyboards.sendKeyboard(
		bot,
		chatId, 
		strings.mainMenuMessage, 
		keyboards.mainMenuKeyboard);
};