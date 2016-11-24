/**
 * Used to walk user through tutorial
 *
 * @module helpers/tutorial
 * @license MIT
 */

/** Dependencies */
const keyboards = require('./keyboards');
const strings = require('./strings');
const adminReports = require('./adminReports');

/**
 * Called when user touches 'Tutorial' on help inline keyboard
 */
global.eventEmitter.on(strings().tutorialInline, ({ bot, user }) => {
  sendTutorial(bot, user);
});

/**
 * Called when user selects freelancer tutorial
 */
global.eventEmitter.on(strings().freelancerTutorialInline, ({ bot, user, msg }) => {
  startFreelancerTutorial(bot, user, msg);
});

/**
 * Called when user selects interested/report/not interested option in freelancer tutorial
 */
global.eventEmitter.on(strings().freelancerTutorialInterestedInline, ({ bot, user, msg }) => {
  const command = msg.data.split(strings().inlineSeparator)[1];
  sendAcceptOrRefuseFreelancerTutorial(bot, user, msg, command === strings().freelancerOptions.interested);
});

/**
 * Called when user selects accept/refuse option in freelancer tutorial
 */
global.eventEmitter.on(strings().freelancerTutorialAcceptInline, ({ bot, user, msg }) => {
  const command = msg.data.split(strings().inlineSeparator)[1];

  sendRateFreelancerTutorial(bot, user, msg, command === strings().freelancerAcceptOptions.accept);
});

/**
 * Called when user selects rate/report option in freelancer tutorial
 */
global.eventEmitter.on(strings().freelancerTutorialRatedInline, ({ bot, user, msg }) => {
  const command = msg.data.split(strings().inlineSeparator)[1];

  sendEndFreelancerTutorial(bot, user, msg, command === strings().jobFinishedOptions.rate);  
});

/**
 * Called when user selects rating in freelancer tutorial
 */
global.eventEmitter.on(strings().freelancerTutorialEndInline, ({ bot, user, msg }) => {
  adminReports.freelancerTutorialEnded(bot, user);

  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, strings().tutorialMessages.freelancerTutorialEnd, []);
});

/**
 * Called when user selects client tutorial
 */
global.eventEmitter.on(strings().clientTutorialInline, ({ bot, user, msg }) => {
  startClientTutorial(bot, user, msg);
});

/**
 * Called when user selects language at client tutorial
 */
global.eventEmitter.on(strings().clientTutorialLanguageInline, ({ bot, user, msg }) => {
  showSupercategoriesClientTutorial(bot, user, msg);
});

/**
 * Called when user selects supercategory at client tutorial
 */
global.eventEmitter.on(strings().clientTutorialSupercategoryInline, ({ bot, user, msg }) => {
  showCategoriesClientTutorial(bot, user, msg);
});

/**
 * Called when user selects category at client tutorial
 */
global.eventEmitter.on(strings().clientTutorialCategoryInline, ({ bot, user, msg }) => {
  showFreelancersClientTutorial(bot, user, msg);
});

/**
 * Called when user selects freelancer as a candidate at client tutorial
 */
global.eventEmitter.on(strings().clientTutorialFreelancersInline, ({ bot, user, msg }) => {
  selectFreelancerClientTutorial(bot, user, msg);
});

global.eventEmitter.on(strings().clientTutorialSelectFreelancer, ({ bot, user, msg }) => {
  showPickFreelancerClientTutorial(bot, user, msg);
});

global.eventEmitter.on(strings().clientTutorialAcceptFreelancerInline, ({ bot, user, msg }) => {
  showRateOrReportClientTutorial(bot, user, msg);
});

global.eventEmitter.on(strings().clientTutorialRatedInline, ({ bot, user, msg }) => {
  const command = msg.data.split(strings().inlineSeparator)[1];

  sendEndClientTutorial(bot, user, msg, command === strings().jobFinishedOptions.rate);  
});

global.eventEmitter.on(strings().clientTutorialEndInline, ({ bot, user, msg }) => {
  adminReports.clientTutorialEnded(bot, user);

  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, strings().tutorialMessages.clientTutorialEnd, []);
});

/**
 * Used to send initial tutorial message to user
 * @param {Telegram:Bot} bot Bot that should send tutorial
 * @param {Mongoose:User} user User that should receive tutorial
 */
function sendTutorial(bot, user) {
  const keyboard = [
    [{ text: strings().tutorialButtons.freelancerTutorial, callback_data: strings().freelancerTutorialInline}],
    [{ text: strings().tutorialButtons.clientTutorial, callback_data: strings().clientTutorialInline}],
  ];
  keyboards.sendInline(bot, user.id, strings().tutorialMessages.initialMessage, keyboard);
}

/** Freelancer tutorial */

/**
 * Used to send first freelancer tutorial message
 * @param {Telegram:Bot} bot Bot that should respond
 * @param {Mongoose:User} user User that should have tutorial started
 * @param {Telegram:Message} msg Message to be editted
 */
function startFreelancerTutorial(bot, user, msg) {
  adminReports.freelancerTutorialStarted(bot, user);

  const keyboard = [
    [{ text: strings().freelancerOptions.interested, callback_data: `${strings().freelancerTutorialInterestedInline}${strings().inlineSeparator}${strings().freelancerOptions.interested}`}],
    [{ text: strings().freelancerOptions.notInterested, callback_data: `${strings().freelancerTutorialInterestedInline}${strings().inlineSeparator}${strings().freelancerOptions.notInterested}`}],
    [{ text: strings().freelancerOptions.report, callback_data: `${strings().freelancerTutorialInterestedInline}${strings().inlineSeparator}${strings().freelancerOptions.report}`}]
  ];
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, strings().tutorialMessages.initialFreelancerMessage, keyboard);
}

/**
 * Used to send second step in freelancer tutorial about reject\accept
 * @param {Telegram:Bot} bot Bot that should respond
 * @param {Mongoose:User} user User that should have tutorial started
 * @param {Telegram:Message} msg Message to be editted
 * @param {Boolean} wasInterested Identifies whether selected option was interested or not
 */
function sendAcceptOrRefuseFreelancerTutorial(bot, user, msg, wasInterested) {
  const keyboard = [];
  const message = (wasInterested) ? strings().tutorialMessages.acceptFreelancerMessage : strings().tutorialMessages.acceptFreelancerMessageNotInterested;
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, `${message}\n\n${strings().loadingMessage}`, keyboard);

  setTimeout(() => {
    const keyboard = [
    [{ text: strings().freelancerAcceptOptions.accept, callback_data: `${strings().freelancerTutorialAcceptInline}${strings().inlineSeparator}${strings().freelancerAcceptOptions.accept}`}],
    [{ text: strings().freelancerAcceptOptions.refuse, callback_data: `${strings().freelancerTutorialAcceptInline}${strings().inlineSeparator}${strings().freelancerAcceptOptions.refuse}`}],
    ];
    const message = strings().tutorialMessages.acceptFreelancerMessageFinished;
    keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, message, keyboard);
    return;
  }, 10000);
}

/**
 * Used to send third step in freelancer tutorial about rating
 * @param {Telegram:Bot} bot Bot that should edit message
 * @param {Mongoose:User} user Owner of this message
 * @param {Telegram:Message} msg Message that should be modified
 * @param {Boolean} isAccept Boolean identifying if user selected accept or not
 */
function sendRateFreelancerTutorial(bot, user, msg, isAccept) {
  const keyboard = [
    [{ text: strings().jobFinishedOptions.rate, callback_data: `${strings().freelancerTutorialRatedInline}${strings().inlineSeparator}${strings().jobFinishedOptions.rate}`},
    { text: strings().jobFinishedOptions.report, callback_data: `${strings().freelancerTutorialRatedInline}${strings().inlineSeparator}${strings().jobFinishedOptions.report}`}],
  ];
  const message = (isAccept) ? strings().tutorialMessages.rateFreelancerMessage : strings().tutorialMessages.rateFreelancerMessageRefused;
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, message, keyboard);
}

/**
 * Used to send rate step freelancer tutorial about rating
 * @param {Telegram:Bot} bot Bot that should edit message
 * @param {Mongoose:User} user Owner of this message
 * @param {Telegram:Message} msg Message that should be modified
 * @param {Boolean} isRate Boolean identifying if user selected rate or not
 */
function sendEndFreelancerTutorial(bot, user, msg, isRate) {
  const keyboard = keyboards.rateKeyboard(strings().freelancerTutorialEndInline);
  const message = (isRate) ? strings().tutorialMessages.endFreelancerMessage : strings().tutorialMessages.endFreelancerMessageReport;
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, message, keyboard);
}

/** Client tutorial */

/**
 * Used to send first client tutorial message
 * @param {Telegram:Bot} bot Bot that should respond
 * @param {Mongoose:User} user User that should have tutorial started
 * @param {Telegram:Message} msg Message to be editted
 */
function startClientTutorial(bot, user, msg) {
  adminReports.clientTutorialStarted(bot, user);
  const keyboard = [
    [{ text: '🇺🇸', callback_data: `${strings().clientTutorialLanguageInline}${strings().inlineSeparator}🇺🇸`},
    { text: '🇷🇺', callback_data: `${strings().clientTutorialLanguageInline}${strings().inlineSeparator}🇷🇺`}],
  ];
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, strings().tutorialMessages.clientTutorialLanguage, keyboard);
}

/**
 * Used to send supercategory picker tutorial step
 * @param {Telegram:Bot} bot Bot that should respond
 * @param {Mongoose:User} user User that should have tutorial continued
 * @param {Telegram:Message} msg Message to be editted
 */
function showSupercategoriesClientTutorial(bot, user, msg) {
  const keyboard = [
    [{ text: 'Design [10]', callback_data: strings().clientTutorialSupercategoryInline }],
    [{ text: 'Development [68]', callback_data: strings().clientTutorialSupercategoryInline}],
    [{ text: 'Copywriting [57]', callback_data: strings().clientTutorialSupercategoryInline }],
  ];
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, strings().tutorialMessages.clientTutorialSupercategory, keyboard);
}

/**
 * Used to send category picker tutorial step
 * @param {Telegram:Bot} bot Bot that should respond
 * @param {Mongoose:User} user User that should have tutorial continued
 * @param {Telegram:Message} msg Message to be editted
 */
function showCategoriesClientTutorial(bot, user, msg) {
  const keyboard = [
    [{ text: 'iOS [10]', callback_data: strings().clientTutorialCategoryInline }],
    [{ text: 'Backend development [1]', callback_data: strings().clientTutorialCategoryInline}],
    [{ text: 'Unity [57]', callback_data: strings().clientTutorialCategoryInline }],
  ];
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, strings().tutorialMessages.clientTutorialCategory, keyboard)
    .catch(/** todo: handle error */);
}

/**
 * Used to send freelancer picker tutorial step
 * @param {Telegram:Bot} bot Bot that should respond
 * @param {Mongoose:User} user User that should have tutorial continued
 * @param {Telegram:Message} msg Message to be editted
 */
function showFreelancersClientTutorial(bot, user, msg) {
  const keyboard = [
    [{ text: `@borodutch`, callback_data: strings().clientTutorialFreelancersInline }],
  ];
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, strings().tutorialMessages.clientTutorialInterestedFreelancers, keyboard)
    .catch(/** todo: handle error */);
}

/**
 * Used to send select freelancer at select candidate tutorial step
 * @param {Telegram:Bot} bot Bot that should respond
 * @param {Mongoose:User} user User that should have tutorial continued
 * @param {Telegram:Message} msg Message to be editted
 */
function selectFreelancerClientTutorial(bot, user, msg) {
  const keyboard = [
    [{ text: `🕒 @borodutch`, callback_data: 'nothing' }],
  ];
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, strings().tutorialMessages.clientTutorialInterestedFreelancers, keyboard)
    .then(() => {
      setTimeout(() => {
        selectFreelancerInterestedClientTutorial(bot, user, msg);
      }, 10000);
    })
    .catch(/** todo: handle error */);
}

/**
 * Used to send make freelancer interested at select candidate tutorial step
 * @param {Telegram:Bot} bot Bot that should respond
 * @param {Mongoose:User} user User that should have tutorial continued
 * @param {Telegram:Message} msg Message to be editted
 */
function selectFreelancerInterestedClientTutorial(bot, user, msg) {
  const keyboard = [
    [{ text: `${strings().jobSelectFreelancer}`, callback_data: strings().clientTutorialSelectFreelancer }],
    [{ text: `✅ @borodutch`, callback_data: 'nothing' }],
  ];
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, strings().tutorialMessages.clientTutorialInterestedFreelancers, keyboard)
    .catch(/** todo: handle error */);
}

/**
 * Used to send freelancer picker tutorial step
 * @param {Telegram:Bot} bot Bot that should respond
 * @param {Mongoose:User} user User that should have tutorial continued
 * @param {Telegram:Message} msg Message to be editted
 */
function showPickFreelancerClientTutorial(bot, user, msg) {
  const keyboard = [
    [{ text: `@borodutch`, callback_data: strings().clientTutorialAcceptFreelancerInline }],
  ];
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, strings().tutorialMessages.clientTutorialPickFreelancer, keyboard)
    .catch(/** todo: handle error */);
}

/**
 * Used to send report/rate tutorial step
 * @param {Telegram:Bot} bot Bot that should respond
 * @param {Mongoose:User} user User that should have tutorial continued
 * @param {Telegram:Message} msg Message to be editted
 */
function showRateOrReportClientTutorial(bot, user, msg) {
  const keyboard = [
    [{ text: strings().jobFinishedOptions.rate, callback_data: `${strings().clientTutorialRatedInline}${strings().inlineSeparator}${strings().jobFinishedOptions.rate}`},
    { text: strings().jobFinishedOptions.report, callback_data: `${strings().clientTutorialRatedInline}${strings().inlineSeparator}${strings().jobFinishedOptions.report}`}],
  ];
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, strings().tutorialMessages.clientTutorialRate, keyboard);
}

/**
 * Used to send rate step freelancer tutorial about rating
 * @param {Telegram:Bot} bot Bot that should edit message
 * @param {Mongoose:User} user Owner of this message
 * @param {Telegram:Message} msg Message that should be modified
 * @param {Boolean} isRate Boolean identifying if user selected rate or not
 */
function sendEndClientTutorial(bot, user, msg, isRate) {
  const keyboard = keyboards.rateKeyboard(strings().clientTutorialEndInline);
  const message = (isRate) ? strings().tutorialMessages.clientTutorialFinishRate : strings().tutorialMessages.clientTutorialFinishRateReport;
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, message, keyboard);
}

/** Exports */
module.exports = {
  sendTutorial,
};