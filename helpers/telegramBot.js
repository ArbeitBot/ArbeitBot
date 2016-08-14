/**
 * Used to initialize Telegam bot
 */

const telegram = require('telegram-bot-api');
const config = require('../config');

module.exports = new telegram({
  token: config.telegram_api_key,
  updates: {
      enabled: true
    }
});

// Start http server for webhooks
var http = require('http');
var server = http.createServer((req, res) => {
	console.log(req);
	res.end(`It Works!! Path Hit: ${request.url}`);
});
server.listen(8443, () => {
	console.log('Server listening on: 8443');
});