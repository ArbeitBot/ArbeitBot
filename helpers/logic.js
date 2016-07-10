let strings = require('./strings');
let keyboards = require('./keyboards');
let dbmanager = require('./dbmanager');
let check = require('./messageParser');
let bot = require('./telegramBot');

// Handle messages

bot.on('message', message => {
	if (check.botCommandStart(message)) {
		sendMainMenu(message.chat.id);
	} else if (check.replyMarkup(message)) {
		console.log(message);
	} else {
		console.log(message);
	}
});

// Sending messages

function sendMainMenu(chatId) {
	keyboards.sendKeyboard(
		bot,
		chatId, 
		strings.mainMenuMessage, 
		keyboards.mainMenuKeyboard);
};

// Helpers

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