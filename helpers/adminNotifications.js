/**
 * Used to send notifications about user actions to admin channels
 *
 * @module helpers/adminNotifications
 * @license MIT
 */

/** Dependencies */
const dbmanager = require('./dbmanager');
const strings = require('./strings');

/** Constants */
const admins = ['260194772', '-168736842'];

global.eventEmitter.on(strings.newReview, ({ bot, dbReviewObject }) => {
  dbmanager.findReviewById(dbReviewObject._id, ['toUser', 'byUser', 'job'])
    .then((review) => {
      sendNewReviewAlerts(bot, review);
    })
    .catch(/** todo: handle error */);
});

/**
 * Getting a keyboard with buttons to respond to new review
 * @param  {Mongoose:Review}  review - Review to be reviewed
 * @return {Telegram:InlineKeyboard}  Inline keyboard with relevant buttons
 */
function adminNewReviewKeyboard(review) {
  const keyboard = [[
    {
      text: 'Ok',
      callback_data: [
        strings.adminNotifications.adminOkReviewInline,
        review._id,
      ].join(strings.inlineSeparator),
    },
    {
      text: 'Ban',
      callback_data: [
        strings.adminNotifications.adminBanReviewInline,
        review._id,
      ].join(strings.inlineSeparator),
    },
    {
      text: 'Delete',
      callback_data: [
        strings.adminNotifications.adminDeleteReviewInline,
        review._id,
      ].join(strings.inlineSeparator),
    },
  ]];

  return keyboard;
}

/**
 * Getting a text for review to show admins
 * @param  {Mongoose:Review}  review - Review tfor which text is generated
 * @return {String}  Text generated for admins from the given review
 */
function formNewReviewMessageText(review) {
  const status = String(review.toUser._id) === (String(review.job.client) ? 'client' : 'freelancer');
  const message =
    `${strings.rateOptionsArray[review.rate - 1]}\n` +
    `@${review.byUser.username} (${status(review, review.byUser._id)}) rated @${review.toUser.username} (${status})\n` +
    `${review.resolveWay || ''}\n` +
    `${review.job.description}`;

  return message;
}

/**
 * Sending all admins a message about new review
 * @param {Telegram:Bot} bot - Bot that should send message
 * @param {Mongoose:Review} review - Review that should be reported
 */
function sendNewReviewAlerts(bot, review) {
  const message = formNewReviewMessageText(review);

  admins.forEach((admin) => {
    const keyboard = adminNewReviewKeyboard(review);
    bot.sendMessage(admin, message, { reply_markup: JSON.stringify({ inline_keyboard: keyboard }) })
      .then((sentMessage) => {
        review.inlineMessages.push(`${sentMessage.message_id}+${sentMessage.chat.id}`);
      })
      .then(() => { review.save(); })
      .catch(err => bot.sendMessage(admin, err.name));
  });
}

global.eventEmitter.on(strings.adminNotifications.adminBanReviewInline, ({ msg, bot }) => {
  const reviewId = msg.data.split(strings.inlineSeparator)[1];

  dbmanager.findReviewById(reviewId, ['toUser', 'byUser', 'job'])
    .then((review) => {
      const reviewCopy = Object.create(review);
      reviewCopy.resolveWay = 'Ban';
      reviewCopy.save();
      banUser(reviewCopy.byUser);
      deleteReview(reviewCopy);
      refreshAllAdminReviewMessages(reviewCopy, bot);
    })
    .catch(/** todo: handle error */);
});

global.eventEmitter.on(strings.adminNotifications.adminDeleteReviewInline, ({ msg, bot }) => {
  // Ищем ревью в базе данных - удаляем
  const reviewId = msg.data.split(strings.inlineSeparator)[1];
  dbmanager.findReviewById(reviewId, ['toUser', 'byUser', 'job'])
    .then((review) => {
      const reviewCopy = Object.create(review);
      reviewCopy.resolveWay = 'Delete';
      reviewCopy.save();
      deleteReview(reviewCopy);
      refreshAllAdminReviewMessages(reviewCopy, bot);
    })
    .catch(/** todo: handle error */);
});

global.eventEmitter.on(strings.adminNotifications.adminOkReviewInline, ({ msg, bot }) => {
  const reviewId = msg.data.split(strings.inlineSeparator)[1];

  //  Everything is ok so we just clear all messages
  dbmanager.findReviewById(reviewId, ['toUser', 'byUser', 'job'])
    .then((review) => {
      const reviewCopy = Object.create(review);
      reviewCopy.resolveWay = 'Ok';
      reviewCopy.save();
      refreshAllAdminReviewMessages(reviewCopy, bot);
    })
    .catch(/** todo: handle error */);
});

/**
 * This function should be called after any button is pressed
 * [OK] [BAN] [DELETE] - anyone of those should hide all buttons
 *
 * @param review - Mongoose Object
 * @param bot
 */

/**
 * Function is called after any inline button is pressed
 * @param {Mongoose:Review} review - Relevant review
 * @param {Telegram:Bot} bot - Bot that should respond
 */
function refreshAllAdminReviewMessages(review, bot) {
  const messages = review.inlineMessages;
  const text = formNewReviewMessageText(review);

  messages.forEach((messageInfo) => {
    const data = messageInfo.split('+');

    bot.editMessageText(text, {
      message_id: data[0],
      chat_id: data[1],
      keyboard: JSON.stringify({ inline_keyboard: [] }),
      disable_web_page_preview: 'true',
    })
    .catch(/** todo: handle error */);
  });
}

/**
 * Deleting a review
 * @param {Mongoose:Review} review - Review to delete
 */
function deleteReview(review) {
  const user = review.toUser;

  user.reviews.remove(review._id);
  user.save();
  user.updateRate();
}

/**
 * Used to ban a use
 * @param {Mongoose:User} user - User to be banned
 */
function banUser(user) {
  if (!user.username) {
    dbmanager.findUserById(user)
      .then((dbuser) => {
        const dbuserCopy = Object.create(dbuser);
        dbuserCopy.ban_state = true;
        dbuserCopy.save();
      })
      .catch(/** todo: handle error */);
  } else {
    const userCopy = Object.create(user);
    userCopy.ban_state = true;
    userCopy.save();
  }
}
