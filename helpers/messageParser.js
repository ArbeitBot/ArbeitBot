/**
 * Used to check messages for conditions like being a command ot answer to keyboard
 *
 * @module helpers/messageParser
 * @license MIT
 */

/** Dependencies */
const strings = require('./strings');

/**
 * Checks if message is '/start' bot command
 *
 * @param {Telegram:Message} message - Message to check
 * @return {Boolean} true if '/start', false otherwise
 */
function botCommandStart(message) {
  if (!message.entities) return false;
  if (!message.entities[0]) return false;
  if (message.entities[0].type === 'bot_command') {
    return message.text === '/start';
  }

  return false;
}

/**
 * Checks if message is an admin command
 * Every admin message starts with: /admin
 * /admin_ban
 * /admin_unban
 * /admin_godvoice
 * @param {Telegram:Message} message - Message to check
 * @return {Boolean} True if admin command, false otherwise
 */
function adminCommand(message) {
  return message.text.indexOf('/admin') == 0;
}

/**
 * Checks if message is answer to any keyboard buttons
 *
 * @param {Telegram:Message} message - Message to check
 * @return {Boolean} True if this message is answer to keyboard button, false otherwise
 */
function replyMarkup(message) {
  const mainMenuOptions = Object.keys(strings().mainMenuOptions).map(
    key => strings().mainMenuOptions[key]
  );

  const freelanceMenuOptions = Object.keys(strings().freelanceMenuOptions).map(
    key => strings().freelanceMenuOptions[key]
  );

  const clientMenuOptions = Object.keys(strings().clientMenuOptions).map(
    key => strings().clientMenuOptions[key]
  );

  const allOptions = mainMenuOptions.concat(freelanceMenuOptions, clientMenuOptions);
  /** todo: remove hardcode */
  allOptions.push('🇺🇸');
  allOptions.push('🇷🇺');
  allOptions.push('🇷🇺 🇺🇸');
  allOptions.push('🇺🇸 🇷🇺');
  return allOptions.indexOf(message.text) > -1;
}

/** Export */
module.exports = {
  botCommandStart,
  replyMarkup,
  adminCommand,
};
