let config = require('../config');
let telegram = require('telegram-bot-api');
let strings = require('./strings');
let dbmanager = require('./dbmanager');

// Setup

let bot = new telegram({
	token: config.telegram_api_key,
	updates: {
		enabled: true,
        get_interval: 2000
    }
});

// Handle messages

bot.on('message', message => {
	if (checkBotCommandStart(message)) {
		sendStartMessage(message.chat.id);
	} else if (!checkReplyMarkup(message)) {
		console.log(message);
	}
});

// Sending messages

function sendStartMessage(chatId) {
	sendKeyboard(
		chatId, 
		strings.startMessage, 
		[strings.replyMarkups.freelancers, strings.replyMarkups.work]);
};

// Freelancer path

function fl_selectedWork(message) {
	dbmanager.addFreelancer(message.from, (err, freelancer) => {
		if (err) {
			// todo: handle error
		} else {
			if (freelancer.categories.length > 0) {
				fl_showMainMenu(freelancer);
			} else {
				fl_askForCategories(freelancer);
			}
		}
	})
};

function fl_askForCategories(freelancer) {
	sendKeyboard(
		freelancer.id,
		strings.askForCategoryMessage,
		strings.categoryNames);
};

function fl_addedCategory(message) {
	let categoryTitle = message.text;

	dbmanager.addCategoryToFreelancer(message.from.id, categoryTitle, (err, freelancer) => {
		if (err) {
			// todo: handle error
		} else {
			fl_showMainMenu(freelancer);
		}
	})
};

function fl_showMainMenu(freelancer) {
	sendKeyboard(
		freelancer.id,
		strings.mainMenuMessage,
		strings.mainMenuOptions);
};

// Helpers

function checkBotCommandStart(message) {
	if (!message.entities) {
		return false;
	}
	if (!message.entities[0]) {
		return false;
	}
	if (message.entities[0].type == 'bot_command') {
		return message.text == '/start';
	} else {
		return false;
	}
};

function checkReplyMarkup(message) {
	let replyMarkups = strings.replyMarkups;
	let text = message.text;

	if (text == replyMarkups.freelancers) {
	} else if (text == replyMarkups.work) {
		fl_selectedWork(message);
	} else if (strings.categoryNames.indexOf(text) > -1) {
		fl_addedCategory(message);
	} else {
		return false;
	}
	return true;
};

function sendKeyboard(chatId, text, buttons) {
	var message = {
		chat_id: chatId,
		text: text,
		reply_markup: {
			keyboard: []
		}
	}
	for (var button of buttons) {
		message.reply_markup.keyboard.push([{
			text: button
		}]);
	}
	message.reply_markup = JSON.stringify(message.reply_markup);
	bot.sendMessage(message)
	.catch(err => console.log(err));
};

function sendInline(chatId, text, inlines, callbacks) {
	var message = {
		chat_id: chatId,
		text: text,
		reply_markup: {
			inline_keyboard: []
		}
	}
	for (var i in inlines) {
		message.reply_markup.inline_keyboard.push([{
			text: inlines[i],
			callback_data: callbacks[i]
		}]);
	}
	message.reply_markup = JSON.stringify(message.reply_markup);
	console.log(message);
	bot.sendMessage(message)
	.catch(err => console.log(err));
};