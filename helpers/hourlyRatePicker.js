let keyboards = require('./keyboards');
let dbmanager = require('./dbmanager');
let strings = require('./strings');

let pageSize = 8;

function handleInline(bot, msg) {
	editHourlyRate(bot, msg);
};

function sendHourlyRate(bot, chatId) {
	dbmanager.getUser(chatId, (err, user) => {
		if (err) {
			// todo: handle error
		} else if (user) {
			let hourlyRates = strings.hourlyRateOptions;
			let keyboard = hourlyRateKeyboard(user, hourlyRates);
			keyboards.sendInline(
				bot, 
				user.id,
				strings.editHourlyRateMessage,
				keyboard);
		} else {
			// todo: handle if user isn't there
		}
	});
};

function editHourlyRate(bot, msg) {
	let command = msg.data.split(strings.inlineSeparator)[1];

	function getUserCallback(user) {
		var send = {
			chat_id: msg.message.chat.id,
			message_id: msg.message.message_id,
			reply_markup: {
				inline_keyboard: hourlyRateKeyboard(user, strings.hourlyRateOptions)
			}
		};
		send.reply_markup = JSON.stringify(send.reply_markup);
		bot.editMessageReplyMarkup(send)
		.catch(err => console.log(err));
	};

	dbmanager.getUser(msg.message.chat.id, (err, user) => {
		if (err) {
			// todo: handle error
		} else if (user) {
			user.hourly_rate = command;
			user.save((err, user) => {
				if (err) {
					// todo: handle error
				} else if (user) {
					getUserCallback(user);
				} else {
					// todo: handle if user wasn't returned
				}
			});
		} else {
			// todo: handle if user wasn't found
		}
	});
};

function hourlyRateKeyboard(user, hourlyRates) {
	let hourlyRate = user.hourly_rate;

	var keyboard = [];
	var tempRow = [];
	for (var i in hourlyRates) {
		let isOdd = i % 2 == 1;
		let currentHR = hourlyRates[i];

		let text = hourlyRate == currentHR ?
			strings.selectedHourlyRate+currentHR :
			currentHR

		tempRow.push({
			text: text,
			callback_data: strings.hourlyRateInline+strings.inlineSeparator+currentHR
		});
		if (isOdd) {
			keyboard.push(tempRow);
			tempRow = [];
		}
	}
	return keyboard;
};

// Exports

module.exports = {
	sendHourlyRate: sendHourlyRate,
	handleInline: handleInline
};