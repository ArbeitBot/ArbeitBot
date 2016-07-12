let keyboards = require('./keyboards');
let dbmanager = require('./dbmanager');
let strings = require('./strings');

let pageSize = 8;

function handleInline(bot, msg) {
	let command = msg.data.split(strings.inlineSeparator)[1];
	let page = parseInt(msg.data.split(strings.inlineSeparator)[2]);
	if (command == strings.categoryLeft) {
		editPage(bot, msg, page-1);
	} else if (command == strings.categoryRight) {
		editPage(bot, msg, page+1);
	} else {
		dbmanager.toggleCategoryForUser(msg.message.chat.id, command, (err, user) => {
			if (err) {
				// todo: handle error
			} else {
				editPage(bot, msg, page);
			}
		});
	}
};

function sendCategories(bot, chatId) {
	dbmanager.getUser(chatId, (err, user) => {
		if (err) {
			// todo: handle error
		} else if (user) {
			dbmanager.getCategories((err, categories) => {
				if (err) {
					// todo: handle error
				} else if (categories) {
					getCategoriesCallback(categories, user, bot);
				} else {
					// todo: handle if categories are empty
				}
			});
		} else {
			// todo: handle if user isn't there
		}
	});
};

function getCategoriesCallback(categories, user, bot) {
	let keyboard = categoriesKeyboard(categories, user, 0);

	keyboards.sendInline(
		bot, 
		user.id,
		strings.pickCategoriesMessage,
		keyboard);
};

function editPage(bot, msg, page) {
	function getCategoriesCallback(categories, user) {
		var send = {
			chat_id: msg.message.chat.id,
			message_id: msg.message.message_id,
			reply_markup: {
				inline_keyboard: categoriesKeyboard(categories, user, page)
			}
		};
		send.reply_markup = JSON.stringify(send.reply_markup);
		bot.editMessageReplyMarkup(send)
		.catch(err => console.log(err));
	};

	function getUserCallback(user) {
		dbmanager.getCategories((err, categories) => {
			if (err) {
				// todo: handle error
			} else if (categories) {
				getCategoriesCallback(categories, user);
			} else {
				// todo: handle if categories are empty
			}
		});
	};

	dbmanager.getUser(msg.message.chat.id, (err, user) => {
		if (err) {
			// todo: handle error
		} else if (user) {
			getUserCallback(user);
		} else {
			// todo: handle if user wasn't found
		}
	});
};

function categoriesKeyboard(categories, user, page) {
	var categoriesLeft = [];
	for (var i in categories) {
		let cat = categories[i];
		var shouldAdd = true;
		for (var j in user.categories) {
			let inCat = user.categories[j];
			if (''+inCat._id == ''+cat._id) {
				shouldAdd = false;
			}
		}
		if (shouldAdd) {
			categoriesLeft.push(cat);
		}
	}
	let allCategories = user.categories.concat(categoriesLeft);
	allCategories = allCategories.slice(page*pageSize,page*pageSize+pageSize);

	var keyboard = [];
	var tempRow = [];
	for (var i in allCategories) {
		let isOdd = i % 2 == 1;
		let isLast = i == allCategories.length - 1
		let currentCategory = allCategories[i];

		let text = user.categories.indexOf(currentCategory) > -1 ?
			strings.selectedCategory+currentCategory.title :
			currentCategory.title

		tempRow.push({
			text: text,
			callback_data: strings.categoryInline+strings.inlineSeparator+currentCategory._id+strings.inlineSeparator+page
		});
		if (isOdd || isLast) {
			keyboard.push(tempRow);
			tempRow = [];
		}
	}

	let navButtons = [];
	if (page > 0) {
		navButtons.push({
			text: strings.categoryLeft,
			callback_data: strings.categoryInline+strings.inlineSeparator+strings.categoryLeft+strings.inlineSeparator+page
		});
	}
	let remainder = categories.length % pageSize;
	let lastPage = (categories.length - remainder) / pageSize;
	if (remainder > 0) {
		lastPage = lastPage + 1;
	}
	if (page+1 < lastPage) {
		navButtons.push({
			text: strings.categoryRight,
			callback_data: strings.categoryInline+strings.inlineSeparator+strings.categoryRight+strings.inlineSeparator+page
		});
	}
	keyboard.push(navButtons);
	if (page+1 == lastPage) {
		keyboard.push([{ 
			text: strings.suggestCategoryMessage,
			url: 'http://telegram.me/borodutch' 
		}]);
	}
	return keyboard;
};

// Exports

module.exports = {
	sendCategories: sendCategories,
	handleInline: handleInline
};