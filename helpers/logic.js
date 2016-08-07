/**
 * Main bot logic that handles incoming messages and routes logic to helpers files
 */

const strings = require('./strings');
const keyboards = require('./keyboards');
const dbmanager = require('./dbmanager');
const check = require('./messageParser');
const bot = require('./telegramBot');
const categoryPicker = require('./categoryPicker');
const hourlyRatePicker = require('./hourlyRatePicker');
const textInput = require('./textInput');
const jobManager = require('./jobManager');
// Handle messages

/**
 * Fired when bot receives a message
 * @param {Telegram:Message} msg Message received by bot
 */
bot.on('message', msg => {
  if (!msg) return;

  textInput.check(msg, (isTextInput, user) => {
    if (isTextInput) {
      textInput.handle(msg, user, bot);
    } else {
      if (check.botCommandStart(msg)) {
        dbmanager.addUser(msg.from)
          .then(user => {
            sendMainMenu(msg.chat.id);
          });
      } else if (check.replyMarkup(msg)) {
        handleKeyboard(msg);
      } else {
        console.log(msg);
      }
    }
  });
});

/**
 * Fired when user clicks button on inlline keyboard
 * @param {Telegram:Message} msg Message that gets passed from user and info about button clicked
 */
bot.on('inline.callback.query', msg => {
  let options = msg.data.split(strings.inlineSeparator);
  let inlineQuerry = options[0];

  eventEmitter.emit(inlineQuerry, { msg, bot })
});

// Helpers

/**
 * Handler for custom keyboard button clicks
 * @param {Telegram:Message} msg Message that is passed with click and keyboard option
 */
function handleKeyboard(msg) {
  const text = msg.text;
  const mainMenuOptions = strings.mainMenuOptions;
  const clientOptions = strings.clientMenuOptions;
  const freelanceMenuOptions = strings.freelanceMenuOptions;

  // Check main menu
  if (text === mainMenuOptions.findJobs) {
    keyboards.sendFreelanceMenu(bot, msg.chat.id);
  } else if (text === mainMenuOptions.findContractors) {
    keyboards.sendClientMenu(bot, msg.chat.id);
  } else if (text === mainMenuOptions.help) {
    keyboards.sendHelp(bot, sg.chat.id);
  }
  // Check client menu
  else if (text === clientOptions.postNewJob) {
    textInput.askForNewJobCategory(msg, bot);
  } else if (text === clientOptions.myJobs) {
    // todo: send all jobs as cards
  }
  // Check freelance menu
  else if (text === freelanceMenuOptions.editBio || text === freelanceMenuOptions.addBio) {
    textInput.askForBio(msg, bot);
  } else if (text === freelanceMenuOptions.editCategories || text === freelanceMenuOptions.addCategories) {
    categoryPicker.sendCategories(bot, msg.chat.id);
  } else if (text === freelanceMenuOptions.editHourlyRate || text === freelanceMenuOptions.addHourlyRate) {
    hourlyRatePicker.sendHourlyRate(bot, msg.chat.id);
  } else if (text === freelanceMenuOptions.busy || text === freelanceMenuOptions.available) {
    toggleUserAvailability(msg.chat.id);
  }
  // Check back button
  else if (text === freelanceMenuOptions.back) {
    keyboards.sendMainMenu(bot, msg.chat.id);
  }
};

// Helpers

/**
 * Toggles user 'busy' status – if it was true, makes it false and vice versa; sends freelancer menu afterwards
 * @param {Number} chatId Chat id of user who should have his busy status toggled
 */
function toggleUserAvailability(chatId) {
  dbmanager.toggleUserAvailability(chatId)
    .then(user => {
      const message = user.busy ? 
        strings.becameBusyMessage : 
        strings.becameAvailableMessage;
      if (!user.bio || user.categories.length <= 0 || !user.hourly_rate) {
        message = user.busy ? 
        strings.missingBecameBusyMessage : 
        strings.missingBecameAvailableMessage;
      }
      keyboards.sendKeyboard(
        bot,
        chatId,
        message,
        keyboards.freelancerKeyboard(user));
    });
};