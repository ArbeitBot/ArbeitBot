/**
 * Used to initialize Telegam bot
 */

const Telegram = require('telegram-bot-api');
const config = require('../config');
const fs = require('fs');
const https = require('https');

const bot = new Telegram({
  token: config.telegram_api_key,
  updates: {
    enabled: !config.should_use_webhooks
  }
});

if (config.should_use_webhooks) {
  // Start http server for webhooks
  const options = {
    key: fs.readFileSync('../certificates/key.pem'),
    cert: fs.readFileSync('../certificates/crt.pem')
  };

  https.createServer(options, (req, res) => {
    if (String(req.url) === '/D83Lw8AXaW793xup1Sxj9j6wR6kE7sJj') {
      console.log('=======================');
      console.log('=======================');
      console.log('=======================');
      console.log(req);
    } else {
      console.log('+++++++++++++++++++++++++++');
      console.log('+++++++++++++++++++++++++++');
      console.log('+++++++++++++++++++++++++++');
      console.log(req);
      res.writeHead(404);
      res.end();
    }
  }).listen(8443, () => {
    console.log('Server listening on: 8443');
  });

  const pathToCertificate = '../certificates/crt.pem';
  bot.setWebhook('https://138.68.6.70:8443/D83Lw8AXaW793xup1Sxj9j6wR6kE7sJj')
}

module.exports = bot;