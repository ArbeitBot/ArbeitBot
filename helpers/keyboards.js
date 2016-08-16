/**
 * File that should handle all keyboards creations and functions (ideally)
 */

const strings = require('./strings');
const dbmanager = require('./dbmanager');

// Keyboards

const mainMenuKeyboard = [
  [{ text: strings.mainMenuOptions.findJobs },
  { text: strings.mainMenuOptions.findContractors }],
  [{ text: strings.mainMenuOptions.help }]
];

const clientKeyboard = [
  [{ text: strings.clientMenuOptions.postNewJob }],
  [{ text: strings.clientMenuOptions.back },
  { text: strings.clientMenuOptions.myJobs }]
];

const helpKeyboard = [
  [{ text: '@borodutch', url: 'http://telegram.me/borodutch' }]
];

// Functions

/**
 * Freelancer main menu keyboard; gives different keyboard depending on user's busy status, existence of bio, categories and hourly rate
 * @param  {Mongoose:User} user User object that should receive keyboard
 * @return {Telegram:Keyboard} Keyboard ready to be shown to user
 */
function freelancerKeyboard(user) {
  const bioText = (user.bio) ? 
    strings.freelanceMenuOptions.editBio :
    strings.freelanceMenuOptions.addBio;
  const categoriesText = (user.categories.length > 0) ?
    strings.freelanceMenuOptions.editCategories :
    strings.freelanceMenuOptions.addCategories;
  const hourlyRateText = (user.hourly_rate) ?
    strings.freelanceMenuOptions.editHourlyRate :
    strings.freelanceMenuOptions.addHourlyRate;
  const availableText = user.busy ?
    strings.freelanceMenuOptions.available :
    strings.freelanceMenuOptions.busy;
  return [
    [{ text: bioText },{ text: categoriesText }],
    [{ text: hourlyRateText }],
    [{ text: strings.freelanceMenuOptions.back },
     { text: availableText }]
  ];
}

/**
 * Constructs rate keyboard with particular inline prefix in button data
 * @param  {String} inline Inline prefix
 * @param  {Mongo:ObjectId} jobId Id of job
 * @return {Telegram:InlineKeyboard} Keyboard with stars and give inline data prefix
 */
function rateKeyboard(inline, jobId) {
  return [
    [{
      text: strings.rateOptions.oneStar,
      callback_data: inline + strings.inlineSeparator + '1' + strings.inlineSeparator + jobId
    },
    {
      text: strings.rateOptions.twoStars,
      callback_data: inline + strings.inlineSeparator + '2' + strings.inlineSeparator + jobId
    },
    {
      text: strings.rateOptions.threeStars,
      callback_data: inline + strings.inlineSeparator + '3' + strings.inlineSeparator + jobId
    }],
    [{
      text: strings.rateOptions.fourStars,
      callback_data: inline + strings.inlineSeparator + '4' + strings.inlineSeparator + jobId
    },
    {
      text: strings.rateOptions.fiveStars,
      callback_data: inline + strings.inlineSeparator + '5' + strings.inlineSeparator + jobId
    }]
  ];
}

/**
 * Sends main menu keyboard to user with chat id
 * @param {Telegram:Bot} bot Bot that should send keyboard
 * @param {Number} chatId Chat id of user who should receive this keyboard
 */
function sendMainMenu(bot, chatId, firstTime) {
  sendKeyboard(
    bot,
    chatId, 
    (firstTime) ? strings.initialMessage : strings.mainMenuMessage, 
    mainMenuKeyboard);
}

/**
 * Sends client menu to user with chat id
 * @param {Telegram:Bot} bot Bot that should send keyboard
 * @param {Number} chatId Chat id of user who should receive keyboard
 */
function sendClientMenu(bot, chatId) {
  sendKeyboard(
    bot,
    chatId, 
    strings.clientMenuMessage, 
    clientKeyboard);
}

/**
 * Sends freelancer menu to user with chat id; checks if user is busy or not, filled bio, hourly rate, categories or not; and sends relevant menu buttons
 * @param {Telegram:Bot} bot Bot that should send keyboard
 * @param {Number} chatId Chat id of user who should receive keyboard
 */
function sendFreelanceMenu(bot, chatId) {
  /** Main freelancer keyboard.
   * It appears after pressing "Find Work" button
   * Here freelancer can add his Bio,
   * Set categories, edit hourly rate,
   * and set Busy status.
   */
  dbmanager.findUser({ id: chatId })
    .then(user => {
      let text = user.busy ? 
        strings.fullFreelancerMessageBusy :
        strings.fullFreelancerMessageAvailable;

      if (!user.bio && user.categories.length <= 0 && !user.hourly_rate) {
        text = strings.emptyFreelancerMessage;
      } else if (!user.bio || user.categories.length <= 0 || !user.hourly_rate) {
        text = strings.missingFreelancerMessage;
      }

      if (user.bio || user.categories.length > 0 || user.hourly_rate) {
        text = `${text}\n`;
        if (user.hourly_rate) {
          text = `${text}\n${user.hourly_rate}`
        }
        if (user.reviews.length > 0) {
          text = `${text}\n${user.GetRateStars()} (${user.reviews.length})`;
        }
        if (user.bio) {
          text = `${text}\n${user.bio}`
        }
        if (user.categories.length > 0) {
          if (user.bio || user.hourly_rate) {
            text = `${text}\n`;
          }
          user.categories.forEach(cat => {
            text = `${text}[${cat.title}]`;
          });
        }
      }

      sendKeyboard(
        bot,
        chatId,
        text,
        freelancerKeyboard(user));
    });
}

/**
 * Sends menu with help to user chat id
 * @param {Telegram:Bot} bot Bot that should send keyboard
 * @param {Number} chatId Chat id of user who should receive keyboard
 */
function sendHelp(bot, chatId) {
  sendInline(
    bot,
    chatId,
    strings.helpMessage,
    helpKeyboard);
}

/**
 * Sends keyboard to user
 * @param  {Telegram:Bot} bot      Bot that should send keyboard
 * @param  {Number} chatId   Telegram chat id where to send keyboard
 * @param  {String} text     Text that should come along with keyboard
 * @param  {Telegram:Keyboard} keyboard Keyboard that should be sent
 * @param  {Function} then     Function that should be executed when message is delivered
 */
function sendKeyboard(bot, chatId, text, keyboard, then) {
  let options = {
    reply_markup: {
      keyboard: keyboard,
      resize_keyboard: true
    },
    disable_web_page_preview: 'true'
  };
  options.reply_markup = JSON.stringify(options.reply_markup);
  bot.sendMessage(chatId, text, options)
    .then(then)
    .catch(err => console.log(err));
}

/**
 * Sends inline to user
 * @param  {Telegram:Bot} bot      Bot that should send inline
 * @param  {Number} chatId   Chat id where to send inline
 * @param  {String} text     Text to send along with inline
 * @param  {Telegram:Inline} keyboard Inline keyboard to send
 */
function sendInline(bot, chatId, text, keyboard, then) {
  let options = {
    reply_markup: {
      inline_keyboard: keyboard
    },
    disable_web_page_preview: 'true'
  };
  options.reply_markup = JSON.stringify(options.reply_markup);
  bot.sendMessage(chatId, text, options)
    .then(then)
    .catch(err => console.log(err));
}

/**
 * Method to edit message with inline
 * @param  {Telegram:Bot} bot       Bot that should edit msg
 * @param  {Number} chatId    Id of chat where to edit msg
 * @param  {Number} messageId Id of message to edit
 * @param  {Telegram:InlineKeyboard} keyboard  Inline keyboard to appear in message
 */
function editInline(bot, chatId, messageId, keyboard) {
  const inlineMarkup = JSON.stringify({
    inline_keyboard: keyboard
  });
  let options = {
    chat_id: chatId,
    message_id: messageId,
    disable_web_page_preview: 'true'
  };
  bot.editMessageReplyMarkup(inlineMarkup, options)
    .catch(err => console.log(err));
}

/**
 * Method to edit message
 * @param  {Telegram:Bot} bot       Bot that should edit msg
 * @param  {Number} chatId    Id of chat where to edit msg
 * @param  {Number} messageId Id of message to edit
 * @param  {String} text      Text to appear in message
 * @param  {Telegram:InlineKeyboard} keyboard  Inline keyboard to appear in message
 */
function editMessage(bot, chatId, messageId, text, keyboard) {
  bot.editMessageText(text, {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: JSON.stringify({
      inline_keyboard: keyboard
    }),
    disable_web_page_preview: 'true'
  }).catch(err => console.log(err.error.description));
}

// Exports

module.exports = {
  freelancerKeyboard,
  rateKeyboard,
  mainMenuKeyboard,
  clientKeyboard,
  helpKeyboard,
  sendMainMenu,
  sendClientMenu,
  sendFreelanceMenu,
  sendHelp,
  sendKeyboard,
  sendInline,
  editInline,
  editMessage
};