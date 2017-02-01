/**
 * Used to send language picker to freelancers as inlines and to handle answers to those inlines
 *
 * @module helpers/languagePicker
 * @license MIT
 */

/** Dependencies */
const keyboards = require('./keyboards');
const dbmanager = require('./dbmanager');
const strings = require('./strings');

/**
 * Handles inline answers from users
 *
 * @param  {Telegram:Bot} bot - Bot that should edit or send hourly rate keyboard
 * @param  {Telegram:Message} msg - Message that came along with inline button click
 */
global.eventEmitter.on(strings().languageInline, ({ msg, bot }) => {
  editLanguage(bot, msg);
});

global.eventEmitter.on(strings().interfaceLanguageInline, ({ msg, bot, user }) => {
  const flag = msg.data.split(strings().inlineSeparator)[1];

  dbmanager.getLanguages()
    .then((languages) => {
      let result;
      languages.forEach((lang) => {
        if (lang.flag === flag) {
          result = lang;
        }
      });
      return { user, language: result, languages };
    })
    .then(({ user, language, languages }) => {
      const userCopy = Object.create(user);
      userCopy.interfaceLanguage = language;
      return userCopy.save()
        .then((savedUser) => {
          const keyboard = interfaceLanguageKeyboard(savedUser, languages);
          return keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, strings().editInterfaceLanguageMessage, keyboard);
        });
    })
    .catch(/** todo: handle error */);
});

/**
 * Used to edit existing message with inline of user who has changed his language
 *
 * @param  {Telegram:Bot} bot - Bot that should edit message
 * @param  {Telegram:Message} msg - Message that came along with inline button click
 */
function editLanguage(bot, msg) {
  const flag = msg.data.split(strings().inlineSeparator)[1];

  dbmanager.findUser({ id: msg.message.chat.id })
    .then(user =>
      dbmanager.getLanguages()
        .then((languages) => {
          let result;
          languages.forEach((lang) => {
            if (lang.flag === flag) {
              result = lang;
            }
          });
          return { user, language: result, languages };
        })
    )
    .then(({ user, language, languages }) => {
      const userCopy = Object.create(user);
      const needCongrats = userCopy.languages.length <= 0;
      const index = userCopy.languages.map(v => String(v._id)).indexOf(String(language._id));
      if (index > -1) {
        userCopy.languages.splice(index, 1);
      } else {
        userCopy.languages.push(language._id);
      }
      return userCopy.save()
        .then((savedUser) => {
          keyboards.editInline(
            bot,
            msg.message.chat.id,
            msg.message.message_id,
            languageKeyboard(savedUser, languages)
          );
          if (needCongrats &&
              savedUser.bio &&
              savedUser.categories.length > 0 &&
              savedUser.languages.length > 0) {
            dbmanager.findUser({ _id: savedUser._id })
              .then((dbuser) => {
                keyboards.sendKeyboard(
                  bot,
                  dbuser.id,
                  strings().filledEverythingMessage,
                  keyboards.freelancerKeyboard(dbuser)
                );
              })
              .catch(/** todo: handle error */);
          }
        });
    })
    .catch(/** todo: handle error */);
}

/**
 * Sends initial message with language picker inline
 *
 * @param  {Telegram:Bot} bot - Bot that should send message and inline
 * @param  {Number} chatId - Chat id of user who should receive inline
 */
function sendLanguagePicker(bot, chatId) {
  dbmanager.findUser({ id: chatId })
    .then(user =>
      dbmanager.getLanguages()
        .then((languages) => {
          const keyboard = languageKeyboard(user, languages);
          keyboards.sendInline(
            bot,
            user.id,
            strings().editLanguageMessage,
            keyboard
          );
        })
    )
    .catch(/** todo: handle error */);
}

/**
 * Gets languages inline keyboard for freelancer;
 * Highlights languages that are currently selected.
 *
 * @param  {Mongoose:User} user - User that should receive keyboard later
 * @param  {[Mongoose:Language]} languages - A list of all languages that should be shown to user
 * @return {Telegram:Inline} Inline keyboard that gets created depending on user's picked
 *    language
 */
function languageKeyboard(user, languages) {
  const row = [];

  languages.forEach((language) => {
    const text =
      (user.languages.map(v => String(v._id) || String(v)).includes(String(language._id))) ?
      strings().selectedLanguage + language.flag :
      language.flag;
    row.push({
      text,
      callback_data: strings().languageInline + strings().inlineSeparator + language.flag,
    });
  });

  return [row];
}

/**
 * Sends initial message with language picker inline
 *
 * @param  {Telegram:Bot} bot - Bot that should send message and inline
 * @param  {Number} chatId - Chat id of user who should receive inline
 */
function sendInterfaceLanguagePicker(bot, chatId) {
  dbmanager.findUser({ id: chatId })
    .then(user =>
      dbmanager.getLanguages()
        .then((languages) => {
          const keyboard = interfaceLanguageKeyboard(user, languages);
          keyboards.sendInline(
            bot,
            user.id,
            strings().editInterfaceLanguageMessage,
            keyboard
          );
        })
    )
    .catch(/** todo: handle error */);
}

/**
 * Gets interface languages inline keyboard;
 * Highlights language that is currently selected.
 *
 * @param  {Mongoose:User} user - User that should receive keyboard later
 * @param  {[Mongoose:Language]} languages - A list of all languages that should be shown to user
 * @return {Telegram:Inline} Inline keyboard that gets created depending on user's picked
 *    language
 */
function interfaceLanguageKeyboard(user, languages) {
  const row = [];

  languages.forEach((language) => {
    let text = language.flag;
    if (user.hasOwnProperty('interfaceLanguage')) {
      if ((String(user.interfaceLanguage._id)  === String(language._id))   ||  
        String(user.interfaceLanguage)  === String(language._id))
      text = strings().selectedLanguage + language.flag;
    }
    row.push({
      text,
      callback_data: strings().interfaceLanguageInline + strings().inlineSeparator + language.flag,
    });
  });

  return [row];
}

module.exports = {
  sendLanguagePicker,
  sendInterfaceLanguagePicker,
};
