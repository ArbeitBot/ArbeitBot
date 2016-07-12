let telegram = require('telegram-bot-api');
let config = require('../config');

module.exports = new telegram({
	token: config.telegram_api_key,
	updates: {
		enabled: true
    }
});