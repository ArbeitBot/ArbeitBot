/**
 * Used to send hourly rate picker to freelancers as inlines and to handle answers to those inlines
 *
 * @module helpers/hourlyRatePicker
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
eventEmitter.on(strings.hourlyRateInline, ({ msg, bot }) => {
  editHourlyRate(bot, msg);
});

/**
 * Sends initial message with hourly rate picker inline
 *
 * @param  {Telegram:Bot} bot - Bot that should send message and inline
 * @param  {Number} chatId - Chat id of user who should receive inline
 */
function sendHourlyRate(bot, chatId) {
  dbmanager.findUser({ id: chatId })
    .then((user) => {
      const hourlyRates = strings.hourlyRateOptions;
      const keyboard = hourlyRateKeyboard(user, hourlyRates);

      keyboards.sendInline(
        bot,
        user.id,
        strings.editHourlyRateMessage,
        keyboard
      );
    });
}

/**
 * Used to edit existing message with inline of user who has changed his hourly rate
 *
 * @param  {Telegram:Bot} bot - Bot that should edit message
 * @param  {Telegram:Message} msg - Message that came along with inline button click
 */
function editHourlyRate(bot, msg) {
  let command = msg.data.split(strings.inlineSeparator)[1];

  function getUserCallback(user) {
    /** @todo: WHAT? Fix it. */
  }

  dbmanager.findUser({ id: msg.message.chat.id })
    .then((user) => {
      const needCongrats = !user.hourly_rate;
      user.hourly_rate = command;
      user.save()
        .then((user) => {
          keyboards.editInline(
            bot,
            msg.message.chat.id,
            msg.message.message_id,
            hourlyRateKeyboard(user, strings.hourlyRateOptions)
          );

          if (needCongrats && user.bio && user.categories.length > 0) {
            keyboards.sendKeyboard(
              bot,
              user.id,
              strings.filledEverythingMessage,
              keyboards.freelancerKeyboard(user)
            );
          }
      });
    });
}

/**
 * Gets hourly rate inline keyboard for freelancer;
 * Highlights hourly rate that is currently selected.
 *
 * @param  {Mongoose:User} user - User that should receive keyboard later
 * @param  {[String]} hourlyRates - A list of all hourly rates that should be shown to user
 * @return {Telegram:Inline} Inline keyboard that gets created depending on user's picked hourly rate
 */
function hourlyRateKeyboard(user, hourlyRates) {
  let hourlyRate = user.hourly_rate;
  let keyboard = [];
  let tempRow = [];

  for (var i in hourlyRates) {
    const isOdd = i % 2 == 1;
    const currentHR = hourlyRates[i];

    const text = hourlyRate == ((currentHR) ?
      strings.selectedHourlyRate + currentHR :
      currentHR
    );

    tempRow.push({
      text: text,
      callback_data: strings.hourlyRateInline + strings.inlineSeparator + currentHR,
    });

    if (isOdd) {
      keyboard.push(tempRow);
      tempRow = [];
    }
  }

  return keyboard;
}

module.exports = {
  sendHourlyRate: sendHourlyRate,
};
