/**
 * Used to initialize Telegam bot
 */

const Telegram = require('telegram-bot-api');
const config = require('../config');
const fs = require('fs');
const https = require('https');
const path = require('path');
const body = require("body/json")

const bot = new Telegram({
  token: config.telegram_api_key,
  updates: {
    enabled: !config.should_use_webhooks
  }
});

function handleBotMessage(item) {
  if (!item) return;
  // Update events
  bot.emit('update', item);

  // Inline events
  if (item.callback_query) {
      bot.emit('inline.callback.query', item.callback_query);
  }

  if (item.edited_message) {
      bot.emit('edited.message', item.edited_message);
  }

  // On inline query is received
  if(item.inline_query)
  {
      bot.emit('inline.query', item.inline_query);
  }

  // On inline result is chosen
  if(item.chosen_inline_result)
  {
      bot.emit('inline.result', item.chosen_inline_result);
  }

  // Notify subscriber
  bot.emit('message', item.message);
}

if (config.should_use_webhooks) {
  // Start http server for webhooks
  const options = {
    key: fs.readFileSync(path.join(config.ssl_key_path)),
    cert: fs.readFileSync(path.join(config.ssl_certificate_path))
  };
  https.createServer(options, (req, res) => {
    if (String(req.url) === `/${config.webhook_token}`) {
      body(req, res, (err, body) => {
        handleBotMessage(body);
      });
      res.writeHead(200);
      res.end();
    } else {
      res.writeHead(404);
      res.end('404');
    }
  }).listen(8443, () => {
    console.log('Server for Telegram web hooks listening on: 8443');
  });
  const pathToCertificate = path.join(config.ssl_certificate_path);
  bot.setWebhook({
    url: `${config.webhook_callback_url}${config.webhook_token}`, 
    certificate: pathToCertificate
  }).then(data => console.log('Telegram webhook is active'))
} else {
  bot.setWebhook({
    url: ''
  })
  console.log('Telegram is using updates instead of webhooks')
}

module.exports = bot;