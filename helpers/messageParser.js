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
	
};

module.exports = {
	botCommandStart: botCommandStart,
	replyMarkup: replyMarkup
}