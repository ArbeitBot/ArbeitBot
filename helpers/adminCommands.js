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
  const message = msg.text.split('/godvoice ')[1];
  if (!message || message.length <= 0) {
    return;
  }

  dbmanager.getAllUsers()
    .then((users) => {
      sendMessage(message, users, bot, {});
    })
    .catch(err => bot.sendMessage(msg.chat.id, err.message));
}

/**
 * Recursive function to send text to an array of users; please don't use this
 *    function twice at any given point of time. Sends at most 30 messages/sec
 *
 * @param {String} text - Text to be sent
 * @param {[Mongoose:User]} users - Users to get this message
 * @param  {Telegram:Bot} bot - Bot that should respond
 */
function sendMessage(text, users, bot, results) {
  if (users.length <= 0) {
    const keys = Object.keys(results);
    const successKeyIndex = keys.indexOf('success');
    if (successKeyIndex > -1) {
      keys.splice(successKeyIndex, 1);
    }
    let message = `All messages were sent, here are the results:\n\nSuccess: ${results.success || 0}`;

    keys.forEach((key) => {
      message = `${message}\n${key}: ${results[key]}`;
    });

    bot.sendMessage(admins[1], message);
    return;
  }

  /** Get current users and users for the next loop */
  const nextUsers = Object.create(users);
  const currentUsers = nextUsers.splice(0, 30);
  const resultsCopy = Object.create(results);

  const promises = [];
  currentUsers.forEach((user) => {
    promises.push(new Promise((resolve) => {
      bot.sendMessage(user.id, text, {
        disable_web_page_preview: 'true',
      })
        .then(() => resolve('success'))
        .catch(err => resolve(String(err.message)));
    }));
  });
  Promise.all(promises)
    .then((values) => {
      values.forEach((value) => {
        if (resultsCopy[value]) {
          resultsCopy[value] += 1;
        } else {
          resultsCopy[value] = 1;
        }
      });
      setTimeout(() => {
        sendMessage(text, nextUsers, bot, resultsCopy);
      }, 1500);
    })
    .catch(err => bot.sendMessage(admins[1], err.message));
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
