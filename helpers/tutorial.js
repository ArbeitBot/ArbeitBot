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
	keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, 'Under development', []);
}

/** Client tutorial */

/**
 * Used to send first client tutorial message
 * @param {Telegram:Bot} bot Bot that should respond
 * @param {Mongoose:User} user User that should have tutorial started
 * @param {Telegram:Message} msg Message to be editted
 */
function startClientTutorial(bot, user, msg) {
	keyboards.editMessage(bot, msg.message.chat.id, msg.message.message_id, 'Under development', []);
}

/** Exports */
module.exports = {
  sendTutorial,
};