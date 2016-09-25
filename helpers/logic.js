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
const profile = require('./profile');
const jobManager = require('./jobManager');
const adminPanel = require('./adminCommands');
const adminReports = require('./adminReports');

// Handle messages

/**
 * Fired when bot receives a message
 * @param {Telegram:Message} msg Message received by bot
 */
bot.on('message', msg => {
  if (!msg) return;
  else if (!msg.from.username) {
  
    sendAskForUsername(msg);
    return;
  }

  textInputCheck(msg, (isTextInput, user) => {
    if (user) {
      if (user.ban_state) {
        sendBanMessage(msg);
        return;
      }
      
      profile.updateProfile(msg, user);
      
      if (isTextInput) {
        eventEmitter.emit(((msg.text === strings.cancel) ? 'cancel' : '') + isTextInput, { msg, user, bot });
      } else {
        if (check.adminCommand(msg)) {
          adminPanel.handleAdminCommand(msg, bot);
        } else if (check.replyMarkup(msg)) {
          handleKeyboard(msg);
        } else {
          console.log(msg);
        }
      }
    } else if (check.botCommandStart(msg)) {
      profile.createProfile(bot, msg);
    }
  });
});

/**
 * Fired when user clicks button on inlline keyboard
 * @param {Telegram:Message} msg Message that gets passed from user and info about button clicked
 */
bot.on('callback_query', msg => {
  if (!msg.from.username) {
    sendAskForUsername(msg);
    return;
  }
  dbmanager.findUser({id: msg.from.id})
    .then(user => {
      if (user.ban_state) {
        sendBanMessage(msg);
        return;
      }
      let options = msg.data.split(strings.inlineSeparator);
      let inlineQuerry = options[0];
      eventEmitter.emit(inlineQuerry, { msg, bot });
    });
});

// Helpers

/**
 * Checks if state of user that sent message is one of input ones
 * @param  {Telegram:Messahe}   msg      Message received
 * @param  {Function} callback Callback(input_state, user) that is called when check is done
 */
function textInputCheck(msg, callback) {
  dbmanager.findUser({ id: msg.chat.id })
  .then(user => {
    if (user) {
      callback(user.input_state, user);
    } else {
      callback();
    }
  })
}

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
    keyboards.sendHelp(bot, msg.chat.id);
  }
  // Check client menu
  else if (text === clientOptions.postNewJob) {
    jobManager.askForNewJobCategory(msg, bot);
  } else if (text === clientOptions.myJobs) {
    jobManager.sendAllJobs(bot, msg);
  }
  // Check freelance menu
  else if (text === freelanceMenuOptions.editBio || text === freelanceMenuOptions.addBio) {
    profile.askForBio(msg, bot);
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
}

/**
 * Sends main menu keyboard to user with chat id
 * @param {Number} chatId Chat id of user who should receive this keyboard
 */
function sendMainMenu(chatId) {
  keyboards.sendKeyboard(
    bot,
    chatId, 
    strings.mainMenuMessage, 
    keyboards.mainMenuKeyboard);
}

/**
 * Sends client menu to user with chat id
 * @param {Number} chatId Chat id of user who should receive keyboard
 */
function sendClientMenu(chatId) {
  keyboards.sendKeyboard(
    bot,
    chatId, 
    strings.clientMenuMessage, 
    keyboards.clientKeyboard);
}

/**
 * Sends freelancer menu to user with chat id; checks if user is busy or not, filled bio, hourly rate, categories or not; and sends relevant menu buttons
 * @param {Number} chatId Chat id of user who should receive keyboard
 */
function sendFreelanceMenu(chatId) {
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
      keyboards.sendKeyboard(
        bot,
        chatId,
        text,
        keyboards.freelancerKeyboard(user));
    });
}

/**
 * Sends menu with help to user chat id
 * @param {Number} chatId Chat id of user who should receive keyboard
 */
function sendHelp(chatId) {
  keyboards.sendInline(
    bot,
    chatId,
    strings.helpMessage,
    keyboards.helpKeyboard);
}

function sendAskForUsername(msg) {
  bot.sendMessage(msg.from.id, strings.askForUsername);
}

function sendBanMessage(msg) {
  bot.sendMessage(msg.from.id, strings.banMessage);
}

// Helpers

/**
 * Toggles user 'busy' status – if it was true, makes it false and vice versa; sends freelancer menu afterwards
 * @param {Number} chatId Chat id of user who should have his busy status toggled
 */
function toggleUserAvailability(chatId) {
  dbmanager.toggleUserAvailability(chatId)
    .then(user => {
      let message = user.busy ?
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
}