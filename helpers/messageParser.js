/**
 * Used to check messages for conditions like meing a command ot answer to keyboard
 */

let strings = require('./strings');

/**
 * Checks if mssage is '/start' bot command
 * @param  {Telegram:Message} message Message to check
 * @return {Boolean}         true if '/start', false otherwise
 */
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

/**
 * Checks if message is answer to any keyboard buttons
 * @param  {Telegram:Message} message Message to check
 * @return {Boolean}         True if this message is answer to keyboard button, false otherwise
 */
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
