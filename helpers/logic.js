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
  if (msg.data.indexOf(strings.categoryInline) > -1) {
    categoryPicker.handleInline(bot, msg);
  } else if (msg.data.indexOf(strings.hourlyRateInline) > -1) {
    hourlyRatePicker.handleInline(bot, msg);
  } else if (msg.data.indexOf(strings.freelancerInline) > -1) {
    jobManager.handleClientInline(bot, msg);
  } else if (msg.data.indexOf(strings.freelancerJobInline) > -1) {
    jobManager.handleFreelancerAnswerInline(bot, msg);
  } else if (msg.data.indexOf(strings.selectFreelancerInline) > -1) {
    jobManager.handleSelectFreelancerInline(bot, msg);
  } else {
    console.log(msg);
  }
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
    sendFreelanceMenu(msg.chat.id);
  } else if (text === mainMenuOptions.findContractors) {
    sendClientMenu(msg.chat.id);
  } else if (text === mainMenuOptions.help) {
    sendHelp(msg.chat.id);
  }
  // Check client menu
  else if (text === clientOptions.postNewJob) {
    textInput.askForNewJobCategory(msg, bot);
  } else if (text === clientOptions.myJobs) {
    sendAllJobsList(msg.from.id, msg.chat.id);
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
    sendMainMenu(msg.chat.id);
  }
};

// Sending messages

/**
 * Sends all job's that are created by user and are currently not finished yet.
 * @param {Number} userId: id of user, to search through database
 * @param {Number} chatId: id of chat, where to respond with message
 *searchingForFreelancer: 'searchingForFreelancer',
  freelancerChosen: 'freelancerChosen',
  finished: 'finished',
  frozen: 'frozen',
  banned: 'banned'
 */
function sendAllJobsList(userId, chatId) {
  dbmanager.findUser(userId, user => {
    if (user) {
      let unfinishedJobs = user.jobs.find((job) => {
        return job.state != strings.jobStates.finished;
      });

      for (var job of unfinishedJobs) {
        //delete old message
        deleteMessage(
          job.current_inline_message_id,
          job.current_inline_chat_id);
        //send new one
        reassignJobMessage(chatId, job);
      }
    } else {
      // todo: user not found
    }
  })
}

function deleteMessage(msgId, chatId) {

}

function reassignJobMessage(chatId, job) {

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
};

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
};

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
};

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