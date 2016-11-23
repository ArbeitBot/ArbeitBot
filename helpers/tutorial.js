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

/** Exports */
module.exports = {
  sendTutorial,
};