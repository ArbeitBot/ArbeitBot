var config = require('../config');
var telegram = require('telegram-bot-api');

var bot = new telegram({
	token: config.telegram_api_key,
	updates: {
		enabled: true,
        get_interval: 2000
    }
});



bot.getMe()
.then(function(data) {
    console.log(data);
})
.catch(function(err) {
    console.log(err);
});

bot.on('message', function(message) {
    console.log(message);
});