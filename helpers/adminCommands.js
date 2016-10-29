/**
 * Used to perform various commands like ban, unban and godvoice on admin channels
 *
 * @module helpers/adminCommands
 * @license MIT
 */

/** Dependencies */
const dbmanager = require('./dbmanager');

/** Constants */
const admins = ['74169393', '-1001052392095'];

/**
 * Check if command is unban
 *
 * @param  {String}  messageText - Text of message to check
 * @return {Boolean}  True if unban command, false otherwise
 */
function isUnbanCommand(messageText) {
  return messageText.indexOf('/unban') === 0;
}

/**
 * Check if command is ban
 *
 * @param  {String}  messageText - Text of message to check
 * @return {Boolean}  True if ban command, false otherwise
 */
function isBanCommand(messageText) {
  return messageText.indexOf('/ban') === 0;
}

/**
 * Check if command is godvoice
 *
 * @param  {String}  messageText - Text of message to check
 * @return {Boolean}  True if godvoice command, false otherwise
 */
function isGodVoiceCommand(messageText) {
  return messageText.indexOf('/godvoice') === 0;
}

/**
 * Check if command is update ratings
 *
 * @param  {String}  messageText - Text of message to check
 * @return {Boolean}  True if update ratings command, false otherwise
 */
function isUpdateRatingsCommand(messageText) {
  return messageText.indexOf('/updateratings') === 0;
}

/**
 * Sends 'confirmed.' string to specified chat id in msg
 *
 * @param  {Telegram:Message} msg - Message that was received
 * @param  {Telegram:Bot} bot - Bot that should respond
 */
function sendConfirmed(msg, bot) {
  bot.sendMessage(msg.chat.id, 'confirmed.');
}

/**
 * Handler for godvoice command, sends received message to all users registered
 *
 * @param  {Telegram:Message} msg - Message that was received
 * @param  {Telegram:Bot} bot - Bot that should respond
 */
function handleGodVoiceCommand(msg, bot) {
  // todo: change to regex
  // let message = /^\/godvoice@?[^ ]* +(.*)$/.exec(msg.text)[1];
  const message = msg.text.split('/godvoice@arbeit_bot ')[1];
  if (!message || message.length <= 0) {
    return;
  }

  dbmanager.getAllUsers()
    .then((users) => {
      users.forEach((user) => {
        bot.sendMessage(user.id, message, {
          disable_web_page_preview: 'true',
        });
      });
    })
    .catch(err => bot.sendMessage(msg.chat.id, err.message));
}

/**
 * Handler for ban command, bans specified user
 *
 * @param  {Telegram:Message} msg - Message that was received
 * @param  {Telegram:Bot} bot - Bot that should respond
 */
function handleBanCommand(msg, bot) {
  const username = /^\/ban@?.* @(.*)$/.exec(msg.text)[1];

  dbmanager.findUser({ username })
    .then((user) => {
      const userCopy = Object.create(user);
      userCopy.ban_state = true;
      return userCopy.save().then(sendConfirmed(msg, bot));
    })
    .catch(err => bot.sendMessage(msg.chat.id, err.message));
}

/**
 * Handler for godvoice command, unbans specified user
 *
 * @param  {Telegram:Message} msg - Message that was received
 * @param  {Telegram:Bot} bot - Bot that should respond
 */
function handleUnbanCommand(msg, bot) {
  const username = /^\/unban@?.* @(.*)$/.exec(msg.text)[1];
  dbmanager.findUser({ username })
    .then((user) => {
      const userCopy = Object.create(user);
      userCopy.ban_state = false;
      return userCopy.save()
        .then(sendConfirmed(msg, bot));
    })
    .catch(err => bot.sendMessage(msg.chat.id, err.message));
}

/**
 * Used to update all users' ratings
 *
 * @param  {Telegram:Message} msg - Message that was received
 * @param  {Telegram:Bot} bot Bot - that should respond
 */
function handleUpdateRatingsCommand(msg, bot) {
  dbmanager.getAllUsers()
    .then((users) => {
      users.forEach((user) => {
        user.updateRate();
      });
    })
    .catch(err => bot.sendMessage(msg.chat.id, err.message));
}

/**
 * Handles admin command
 *
 * @param  {Telegram:Message} msg - Message that was received
 * @param  {Telegram:Bot} bot - Bot that should respond
 */
function handleAdminCommand(msg, bot) {
  if (!admins.includes(String(msg.chat.id))) return;

  const messageText = msg.text;
  if (isUnbanCommand(messageText)) {
    handleUnbanCommand(msg, bot);
  } else if (isBanCommand(messageText)) {
    handleBanCommand(msg, bot);
  } else if (isGodVoiceCommand(messageText)) {
    handleGodVoiceCommand(msg, bot);
  } else if (isUpdateRatingsCommand(messageText)) {
    handleUpdateRatingsCommand(msg, bot);
  }
}

/** Recalculate all ratings as soon as bot is launched */
handleUpdateRatingsCommand(0, 0);

module.exports = {
  handleAdminCommand,
};
