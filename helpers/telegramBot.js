/**
 * Used to initialize Telegam bot
 *
 * @module helpers/telegramBot
 * @license MIT
 */

/** Dependencies */
const Telegram = require('node-telegram-bot-api');
const config = require('../config');
const path = require('path');

let bot;

if (config.should_use_webhooks) {
  const options = {
    webHook: {
      port: 8443,
      key: path.join(config.ssl_key_path),
      cert: path.join(config.ssl_certificate_path),
    },
  };

  bot = new Telegram(config.telegram_api_key, options);
  bot.setWebHook(
    `${config.webhook_callback_url}${config.telegram_api_key}`,
    path.join(config.ssl_certificate_path)
  ).then(() => { console.log('Telegram webhook is active'); }) // eslint-disable-line no-console
  .catch(/** todo: handle error */);
} else {
  bot = new Telegram(config.telegram_api_key, {
    polling: true,
  });

  bot.setWebHook({ url: '' });

  console.log('Telegram is using updates instead of webhooks'); // eslint-disable-line no-console
}

module.exports = bot;
