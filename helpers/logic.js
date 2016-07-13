let strings = require('./strings');
let keyboards = require('./keyboards');
let dbmanager = require('./dbmanager');
let check = require('./messageParser');
let bot = require('./telegramBot');
let categoryPicker = require('./categoryPicker');
let hourlyRatePicker = require('./hourlyRatePicker');
let textInput = require('./textInput');

// Handle messages

bot.on('message', msg => {
	textInput.check(msg, (isTextInput, user) => {
		if (isTextInput) {
			textInput.handle(msg, user, bot);
		} else {
			if (check.botCommandStart(msg)) {
				dbmanager.addUser(msg.from, err => {
					sendMainMenu(msg.chat.id);
				});
			} else if (check.replyMarkup(msg)) {
				handleInline(msg);
			} else {
				console.log(msg);
			}
		}
	});
});

bot.on('inline.callback.query', msg => {
	if (msg.data.indexOf(strings.categoryInline) > -1) {
		categoryPicker.handleInline(bot, msg);
	} else if (msg.data.indexOf(strings.hourlyRateInline) > -1) {
		hourlyRatePicker.handleInline(bot, msg);
	} else {
		console.log(msg);
	}
});

// Helpers

function handleInline(msg) {
	let text = msg.text;
	let mainMenuOptions = strings.mainMenuOptions;
	let clientOptions = strings.clientMenuOptions;
	let freelanceMenuOptions = strings.freelanceMenuOptions;

	// Check main menu
	if (text == mainMenuOptions.findJobs) {
		sendFreelanceMenu(msg.chat.id);
	} else if (text == mainMenuOptions.findContractors) {
		sendClientMenu(msg.chat.id);
	} else if (text == mainMenuOptions.help) {
		sendHelp(msg.chat.id);
	}
	// Chack client menu
	else if (text == clientOptions.postNewJob) {
		textInput.askForNewJobCategory(msg, bot);
	} else if (text == clientOptions.myJobs) {
		// todo: send all jobs as cards
	}
	// Check freelance menu
	else if (text == freelanceMenuOptions.editBio || text == freelanceMenuOptions.addBio) {
		textInput.askForBio(msg, bot);
	} else if (text == freelanceMenuOptions.editCategories || text == freelanceMenuOptions.addCategories) {
		categoryPicker.sendCategories(bot, msg.chat.id);
	} else if (text == freelanceMenuOptions.editHourlyRate || text == freelanceMenuOptions.addHourlyRate) {
		hourlyRatePicker.sendHourlyRate(bot, msg.chat.id);
	} else if (text == freelanceMenuOptions.busy || text == freelanceMenuOptions.available) {
		toggleUserAvailability(msg.chat.id);
	}
	// Chack back button
	else if (text == freelanceMenuOptions.back) {
		sendMainMenu(msg.chat.id);
	}
};

// Sending messages

function sendMainMenu(chatId) {
	keyboards.sendKeyboard(
		bot,
		chatId, 
		strings.mainMenuMessage, 
		keyboards.mainMenuKeyboard);
};

function sendClientMenu(chatId) {
	keyboards.sendKeyboard(
		bot,
		chatId, 
		strings.clientMenuMessage, 
		keyboards.clientKeyboard);
};

function sendFreelanceMenu(chatId) {
	dbmanager.getUser(chatId, (err, user) => {
		if (err) {
			// todo: handle error
		} else if (user) {
			var text = user.busy ? 
				strings.fullFreelancerMessageBusy :
				strings.fullFreelancerMessageAvailable;
			if (!user.bio && user.categories.length <= 0 && !user.hourly_rate) {
				text = strings.emptyFreelancerMessage;
			} else if (!user.bio || user.categories.length <= 0 || !user.hourly_rate) {
				text = strings.missingFreelancerMessage;
			}
			keyboards.sendKeyboard(
				bot,
				chatId,
				text,
				keyboards.freelancerKeyboard(user));
		} else {
			// todo: handle case when user doesn't exist – basically impossible one
		}
	});
};

function sendEditHourlyRate(chatId) {
	keyboards.sendInline(
		bot,
		chatId,
		strings.editHourlyRateMessage,
		keyboards.hourlyRateKeyboard);
};

function sendHelp(chatId) {
	keyboards.sendInline(
		bot,
		chatId,
		strings.helpMessage,
		keyboards.helpKeyboard);
};

// Helpers

function toggleUserAvailability(chatId) {
	dbmanager.toggleUserAvailability(chatId, (err, user) => {
		if (err) {
			// todo: handle error
		} else if (user) {
			var message = user.busy ? 
				strings.becameBusyMessage : 
				strings.becameAvailableMessage;
			if (!user.bio || user.categories.length <= 0 || !user.hourly_rate) {
				message = user.busy ? 
				strings.missingBecameBusyMessage : 
				strings.missingBecameAvailableMessage;
			}
			keyboards.sendKeyboard(
				bot,
				chatId,
				message,
				keyboards.freelancerKeyboard(user));
		} else {
			// todo: handle case when user doesn't exist
		}
	});
};