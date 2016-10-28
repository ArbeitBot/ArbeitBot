/**
 * @module helpers/profile
 * @license MIT
 */

/** Dependencies */
const adminReports = require('./adminReports');
const dbmanager = require('./dbmanager');
const keyboards = require('./keyboards');
const strings = require('./strings');

eventEmitter.on(strings.inputBioState, ({ msg, user, bot }) => {
  const needsCongrats = !user.bio && !!user.hourly_rate && user.categories.length > 0;
  const newBio = msg.text.substring(0, 150);

  user.bio = newBio;
  user.input_state = undefined;
  user.save()
    .then((user) => {
      bot.sendMessage(msg.chat.id, strings.changedBioMessage + user.bio, {
        reply_markup: JSON.stringify({
          keyboard: keyboards.freelancerKeyboard(user),
          resize_keyboard: true,
        }),
        disable_web_page_preview: 'true',
      })
        .then((data) => {
          if (needsCongrats) {
            keyboards.sendKeyboard(
              bot,
              user.id,
              strings.filledEverythingMessage,
              keyboards.freelancerKeyboard(user)
            );
          }
        })
        .catch((err) => { console.error(err.message); });
    });
});

eventEmitter.on('cancel' + strings.inputBioState, ({ msg, user, bot }) => {
  user.input_state = undefined;
  user.save()
    .then((user) => {
      bot.sendMessage(msg.chat.id, strings.notChangedBioMessage + user.bio, {
        reply_markup: JSON.stringify({
          keyboard: keyboards.freelancerKeyboard(user),
          resize_keyboard: true,
        }),
        disable_web_page_preview: 'true',
      }).catch((err) => { console.error(err.message); });
    });
});

function createProfile(bot, msg) {
  dbmanager.addUser(msg.from)
    .then((obj) => {
      const user = obj.user;
      const isNew = obj.new;

      if (isNew) adminReports.userRegistered(bot, user);
      keyboards.sendMainMenu(bot, msg.chat.id, true);
    });
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
      user.input_state = strings.inputBioState;
      user.save()
        .then((user) => {
          const message = ((user.bio) ?
            strings.editBioMessage + '\n\n' + strings.yourCurrentBio + '\n\n' + user.bio :
            strings.editBioMessage
          );

          bot.sendMessage(msg.chat.id, message, {
            reply_markup: JSON.stringify({
              keyboard: [[strings.cancel]],
              resize_keyboard: true,
            }),
            disable_web_page_preview: 'true',
          }).catch((err) => { console.error(err.message); });
        });
    });
}

function updateProfile(msg, user) {
  if (msg.from.first_name !== user.first_name || msg.from.last_name !== user.last_name || msg.from.username !== user.username) {
    user.first_name = msg.from.first_name;
    user.last_name = msg.from.last_name;
    user.username = msg.from.username;

    user.save()
      .catch((err) => { console.error(err.message); });
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
        strings.becameBusyMessage :
        strings.becameAvailableMessage
      );

      if (!user.bio || user.categories.length <= 0 || !user.hourly_rate) {
        message = ((user.busy) ?
          strings.missingBecameBusyMessage :
          strings.missingBecameAvailableMessage
        );
      }

      keyboards.sendKeyboard(bot, chatId, message, keyboards.freelancerKeyboard(user));
    });
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
    });
}

function sendAskForUsername(bot, msg) {
  bot.sendMessage(msg.from.id, strings.askForUsername);
}

function sendBanMessage(bot, msg) {
  bot.sendMessage(msg.from.id, strings.banMessage);
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
