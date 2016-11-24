/**
 * Used to walk user through tutorial
 *
 * @module helpers/tutorial
 * @license MIT
 */

/** Dependencies */
const keyboards = require('./keyboards');
const strings = require('./strings');

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
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, strings().tutorialMessages.freelancerTutorialEnd, []);
});

/**
 * Called when user selects client tutorial
 */
global.eventEmitter.on(strings().clientTutorialInline, ({ bot, user, msg }) => {
  startClientTutorial(bot, user, msg);
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
  /** todo: bot report start of tutorial */
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
  /** todo: bot report start of tutorial */
  keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, 'Under development', []);
}

/** Exports */
module.exports = {
  sendTutorial,
};