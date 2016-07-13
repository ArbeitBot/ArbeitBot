let strings = require('./strings');

function botCommandStart(message) {
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

function replyMarkup(message) {
	let mainMenuOptions = Object.keys(strings.mainMenuOptions).map(key => strings.mainMenuOptions[key]);
	let freelanceMenuOptions = Object.keys(strings.freelanceMenuOptions).map(key => strings.freelanceMenuOptions[key]);
	let clientMenuOptions = Object.keys(strings.clientMenuOptions).map(key => strings.clientMenuOptions[key]);
	let allOptions = mainMenuOptions.concat(freelanceMenuOptions, clientMenuOptions);
	return allOptions.indexOf(message.text) > -1;
};

// Export

module.exports = {
	botCommandStart: botCommandStart,
	replyMarkup: replyMarkup
}
