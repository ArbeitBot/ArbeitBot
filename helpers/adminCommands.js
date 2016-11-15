/**
 * Used to perform various commands available only to admins.
 * Supported commands:
 * /ban @username
 * /unban @username
 * /updateratings
 * /godvoice Message
 * @module helpers/adminCommands
 * @license MIT
 */

/** Dependencies */
const dbmanager = require('./dbmanager');
const strings = require('./strings');
const keyboards = require('./keyboards');

global.eventEmitter.on(strings().resubscribeGodvoiceInline, ({ msg, bot, user }) => {
  const userCopy = Object.create(user);
  userCopy.unsubscribefromGodvoice = false;
  userCopy.save()
    .then((savedUser) => {
      keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, msg.message.text, []);
    })
    .catch(/** todo: handle error */);
});

global.eventEmitter.on(strings().unsubscripeFromGodvoiceInline, ({ msg, bot, user }) => {
  const userCopy = Object.create(user);
  userCopy.unsubscribefromGodvoice = true;
  userCopy.save()
    .then((savedUser) => {
      keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, msg.message.text, [[{
          text: strings(savedUser).resubscribe,
          callback_data: strings().resubscribeGodvoiceInline + strings().inlineSeparator + user._id
        }]]);
    })
    .catch(/** todo: handle error */);
});

global.eventEmitter.on(strings().hideButtonsGodvoiceInline, ({ msg, bot, user }) => {
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, msg.message.text, []);
});

/**
 * Constants
 * Those are chat id's of chat admins
 * Delete ours - set yours
 * After that bot will react on commands inside this chats
 */
const admins = ['74169393', '-1001052392095'];

function checkIfMessageIsCommand (command, messageText) {
  "use strict";
  return messageText.indexOf(command) === 0;
}

/**
 * This methods separates the message with first space aka ' ' character.
 * Separates the command itself with the data provided.
 * Examples:
 * '/ban @username 123' => '@username 123'
 * '/unban @username' => '@username'
 * '/unban' => null
 * @param messageText
 */
function getCommandData (messageText) {
  "use strict";
  if (!~messageText.indexOf(' ')) return null;

  return messageText.substr(messageText.indexOf(' ') + 1);
}

/**
 * Sends 'confirmed.' string to specified chat id in msg
 * Used to responds on commands so the admin can know everything is ok
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
  const message = getCommandData(msg.text);
  if (!message || message.length <= 0) {
    return;
  }
  console.log(message);
  dbmanager.getAllUsers({ $or: [ { unsubscribefromGodvoice: false }, { unsubscribefromGodvoice: { $exists: false } }] })
    .then((users) => {
      sendMessage(message, users, bot, {});
    })
    .catch(/** todo: handle error */);
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
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [{
              text: strings(user).unsubscribe,
              callback_data: strings().unsubscripeFromGodvoiceInline + strings().inlineSeparator + user._id
            }],
            [{
              text: strings(user).hideButtons,
              callback_data: strings().hideButtonsGodvoiceInline + strings().inlineSeparator + user._id
            }],
          ]
        }),
        disable_web_page_preview: 'true',
      })
        .then(() => resolve('success'))
        .catch(err => {
          resolve(String(err.message))
        });
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
  const username = /^\/admin_ban@?.* @(.*)$/.exec(msg.text)[1];
  dbmanager.findUser({ username })
    .then((user) => {
      const userCopy = Object.create(user);
      userCopy.ban_state = true;
      return userCopy.save().then(sendConfirmed(msg, bot));
    })
    .catch(err => bot.sendMessage(msg.chat.id, err.message));
}

/**
 * Handler for /unban command, unbans specified user
 *
 * @param  {Telegram:Message} msg - Message that was received
 * @param  {Telegram:Bot} bot - Bot that should respond
 */
function handleUnbanCommand(msg, bot) {
  const username = /^\/admin_unban@?.* @(.*)$/.exec(msg.text)[1];
  dbmanager.findUser({ username })
    .then((user) => {
      const userCopy = Object.create(user);
      userCopy.ban_state = false;
      return userCopy.save().then(sendConfirmed(msg, bot));
    })
    .catch(err => bot.sendMessage(msg.chat.id, err.message));
}

/**
 * Used to update all users' ratings
 * (used just in case smth went wrong, usually bot updates them himself)
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
 * Handles any admin's command
 * 
 * To add your own command create a handler for it
 * and append it to the if-else tree following tip-comment below.
 * @param  {Telegram:Message} msg - Message that was received
 * @param  {Telegram:Bot} bot - Bot that should respond
 */
function handleAdminCommand(msg, bot) {
  if (!admins.includes(String(msg.chat.id))) return;

  const messageText = msg.text;
  if (checkIfMessageIsCommand('/admin_unban', messageText)) {
    handleUnbanCommand(msg, bot);
  } else if (checkIfMessageIsCommand('/admin_ban', messageText)) {
    handleBanCommand(msg, bot);
  } else if (checkIfMessageIsCommand('/admin_godvoice', messageText)) {
    handleGodVoiceCommand(msg, bot);
  } else if (checkIfMessageIsCommand('/admin_updateratings', messageText)) {
    handleUpdateRatingsCommand(msg, bot);
  } /* else if (checkIfMessageIsCommand('/admin_%yourcommand%', messageText)) {
    handleYourCommand(msg, bot);
  } */
}

/** Recalculate all ratings as soon as bot is launched */
handleUpdateRatingsCommand(0, 0);

module.exports = {
  handleAdminCommand,
};
