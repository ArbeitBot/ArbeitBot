/**
 * @module helpers/profile
 * @license MIT
 */

/** Dependencies */
const adminReports = require('./adminReports');
const dbmanager = require('./dbmanager');
const keyboards = require('./keyboards');
const strings = require('./strings');
const tutorial = require('./tutorial');

global.eventEmitter.on(strings().inputBioState, ({ msg, user, bot }) => {
  if (msg.text.length > 150) {
    bot.sendMessage(msg.chat.id, strings().bioErrorMessage);
    return;
  }

  const needsCongrats = !user.bio &&
    user.hourly_rate &&
    user.categories.length > 0
    && user.languages.length > 0;
  const newBio = msg.text.substring(0, 150);
  const userCopy = Object.create(user);
  userCopy.bio = newBio;
  userCopy.input_state = undefined;
  userCopy.save()
    .then((savedUser) => {
      bot.sendMessage(msg.chat.id, strings().changedBioMessage + savedUser.bio, {
        reply_markup: JSON.stringify({
          keyboard: keyboards.freelancerKeyboard(savedUser),
          resize_keyboard: true,
        }),
        disable_web_page_preview: 'true',
      })
        .then(() => {
          if (needsCongrats) {
            keyboards.sendKeyboard(
              bot,
              savedUser.id,
              strings().filledEverythingMessage,
              keyboards.freelancerKeyboard(savedUser)
            );
          }
        })
        .catch(/** todo: handle error */);
    })
    .catch(/** todo: handle error */);
});

global.eventEmitter.on(strings().inputBioCancelInline, ({ msg, user, bot }) => {
  const userCopy = Object.create(user);

  userCopy.input_state = undefined;
  userCopy.save()
    .then(() =>
      keyboards.editMessage(bot,
        msg.message.chat.id,
        msg.message.message_id,
        msg.message.text,
        [])
        .then(() => {
          keyboards.sendFreelanceMenu(bot, msg.message.chat.id);
        })
    )
    .catch(/** todo: handle error */);
});

/**
 * Used to create a profile for the sender of message
 * @param {Telegram:Bot} bot - Bot that should respond
 * @param {Telegram:Message} msg - Message that triggered this function
 */
function createProfile(bot, msg) {
  dbmanager.addUser(msg.from)
    .then((obj) => {
      const user = obj.user;
      const isNew = obj.new;

      if (isNew) adminReports.userRegistered(bot, user);
      keyboards.sendMainMenu(bot, msg.chat.id, true)
        .then(() => {
          tutorial.sendTutorial(bot, user);
        });
    })
    .catch(/** todo: handle error */);
}

/**
 * Sends message to user asking for bio and adds relevant flags to user's object
 *
 * @param {Telegram:Message} msg - Message received
 * @param {Telegram:Bot} bot - Bot that should respond
 */
function askForBio(msg, bot) {
  dbmanager.findUser({ id: msg.chat.id })
    .then((user) => {
      const userCopy = Object.create(user);
      userCopy.input_state = strings().inputBioState;
      return userCopy.save()
        .then((savedUser) => {
          const message = ((savedUser.bio) ?
            `${strings().editBioMessage}\n\n${strings().yourCurrentBio}\n\n${savedUser.bio}` :
            strings().editBioMessage
          );
          return keyboards.hideKeyboard(bot, msg.chat.id, strings().addBioHideKeyboardMessage)
            .then(() => {
              keyboards.sendInline(bot,
                msg.chat.id,
                message,
                [[{
                  text: strings().cancel,
                  callback_data: `${strings().inputBioCancelInline}${strings().inlineSeparator}`,
                }]]);
            });
        });
    })
    .catch(/** todo: handle error */);
}

/**
 * Function to update user's profile
 * @param {Tleegram:Message} msg - Message that triggered this action
 * @param {Mongoose:User} user - User which profile should be updated
 */
function updateProfile(msg, user) {
  if (msg.from.first_name !== user.first_name ||
    msg.from.last_name !== user.last_name ||
    msg.from.username !== user.username) {
    const userCopy = Object.create(user);
    userCopy.first_name = msg.from.first_name;
    userCopy.last_name = msg.from.last_name;
    userCopy.username = msg.from.username;

    userCopy.save()
      .catch(/** todo: handle error */);
  }
}

/**
 * Toggles user 'busy' status – if it was true, makes it false and vice versa;
 * Sends freelancer menu afterwards.
 *
 * @param {Telegram:Bot} bot - Bot that should respond
 * @param {Number} chatId - Chat id of user who should have his busy status toggled
 */
function toggleAvailability(bot, chatId) {
  dbmanager.toggleUserAvailability(chatId)
    .then((user) => {
      let message = ((user.busy) ?
        strings().becameBusyMessage :
        strings().becameAvailableMessage
      );

      if (!user.bio || user.categories.length <= 0 || !user.hourly_rate) {
        message = ((user.busy) ?
          strings().missingBecameBusyMessage :
          strings().missingBecameAvailableMessage
        );
      }

      keyboards.sendKeyboard(bot, chatId, message, keyboards.freelancerKeyboard(user));
    })
    .catch(/** todo: handle error */);
}

/** Helpers */

/**
 * Checks if state of user that sent message is one of input ones
 *
 * @param {Telegram:Messahe} msg - Message received
 * @param {Function} callback - Callback(input_state, user) that is called when check is done
 */
function textInputCheck(msg, callback) {
  dbmanager.findUser({ id: msg.chat.id })
    .then((user) => {
      if (user) callback(user.input_state, user);
      else callback();
    })
    .catch(/** todo: handle error */);
}

/**
 * Function to send request for username to users without Telegram username
 * @param {Telegram:Bot} bot - Bot that should send message
 * @param {Telegram:Message} msg - Message that triggered this action
 */
function sendAskForUsername(bot, msg) {
  bot.sendMessage(msg.from.id, strings().askForUsername);
}

/**
 * Function to send note to user that they are banned
 * @param {Telegram:Bot} bot - Bot that should send message
 * @param {Telegram:Message} msg - Message that triggered this action
 */
function sendBanMessage(bot, msg) {
  bot.sendMessage(msg.from.id, strings().banMessage);
}

/** Exports */
module.exports = {
  createProfile,
  updateProfile,
  askForBio,
  toggleAvailability,
  textInputCheck,
  sendAskForUsername,
  sendBanMessage,
};
