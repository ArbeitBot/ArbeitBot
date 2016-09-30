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

// Handle messages

/**
 * Fired when bot receives a message
 * @param {Telegram:Message} msg Message received by bot
 */
bot.on('message', msg => {
  if (!msg) return;
  else if (!msg.from.username) {
    profile.sendAskForUsername(bot, msg);
    return;
  }
  
  profile.textInputCheck(msg, (isTextInput, user) => {
    if (user) {
      if (user.ban_state) {
        profile.sendBanMessage(bot, msg);
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
    profile.sendAskForUsername(msg);
    return;
  }
  dbmanager.findUser({id: msg.from.id})
    .then(user => {
      if (user.ban_state) {
        profile.sendBanMessage(msg);
        return;
      }
      let options = msg.data.split(strings.inlineSeparator);
      let inlineQuerry = options[0];
      eventEmitter.emit(inlineQuerry, { msg, bot });
    });
});


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
    profile.toggleAvailability(bot, msg.chat.id);
  }
  // Check back button
  else if (text === freelanceMenuOptions.back) {
    keyboards.sendMainMenu(bot, msg.chat.id);
  }
}
