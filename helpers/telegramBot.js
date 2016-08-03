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