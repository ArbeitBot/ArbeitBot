let keyboards = require('./keyboards');
let dbmanager = require('./dbmanager');
let strings = require('./strings');
var _ = require('lodash');

let pageSize = 2;

function handleInline(bot, msg) {
	let command = msg.data.split(strings.inlineSeparator)[1];
	console.log(command);
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
	let keyboard = categoriesKeyboard(categories, user, 2);

	keyboards.sendInline(
		bot, 
		user.id,
		strings.pickCategoriesMessage,
		keyboard);
};

function categoriesKeyboard(categories, user, page) {
	let categoriesLeft = _.difference(categories, user.categories);
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
			callback_data: strings.categoryInline+strings.inlineSeparator+currentCategory._id
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
			callback_data: strings.categoryInline+strings.inlineSeparator+strings.categoryLeft
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
			callback_data: strings.categoryInline+strings.inlineSeparator+strings.categoryRight
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