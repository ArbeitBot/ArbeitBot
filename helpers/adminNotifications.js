/**
 * Used to send notifications about user actions to admin channels
 *
 * @module helpers/adminNotifications
 * @license MIT
 */

/** Eslint */
/*eslint "no-underscore-dangle": "warn"*/

/** Dependencies */
const dbmanager = require('./dbmanager');
const strings = require('./strings');

const admins = ['74169393', '-1001052392095'];

eventEmitter.on(strings.newReview, ({ bot, dbReviewObject }) => {
  dbmanager.findReviewById(dbReviewObject._id, ['toUser', 'byUser', 'job'])
    .then((review) => {
      sendNewReviewAlerts(bot, review);
    });
});

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

function formNewReviewMessageText(review) {
  function status(review, userId) {
    return String(userId) === (String(review.job.client) ? 'client' : 'freelancer');
  }

  const message =
    `${strings.rateOptionsArray[review.rate - 1]}\n` +
    `@${review.byUser.username} (${status(review, review.byUser._id)}) rated @${review.toUser.username} (${status(review, review.toUser._id)})\n` +
    `${review.resolveWay || ''}\n` +
    `${review.job.description}`;

  return message;
}

function sendNewReviewAlerts(bot, review) {
  const message = formNewReviewMessageText(review);

  admins.forEach((admin) => {
    const keyboard = adminNewReviewKeyboard(review);
    bot.sendMessage(admin, message, { reply_markup: JSON.stringify({ inline_keyboard: keyboard }) })
      .then((message) => {
        review.inlineMessages.push(`${message.message_id}+${message.chat.id}`);
      })
      .then(() => { review.save(); })
      .catch((err) => { console.log(err.name); });
  });
}

eventEmitter.on(strings.adminNotifications.adminBanReviewInline, ({ msg, bot }) => {
  const reviewId = msg.data.split(strings.inlineSeparator)[1];

  dbmanager.findReviewById(reviewId, ['toUser', 'byUser', 'job'])
    .then((review) => {
      review.resolveWay = 'Ban';
      review.save();
      banUser(review.byUser);
      deleteReview(review);
      refreshAllAdminReviewMessages(review, bot);
    });
});

eventEmitter.on(strings.adminNotifications.adminDeleteReviewInline, ({ msg, bot }) => {
  // Ищем ревью в базе данных - удаляем
  const reviewId = msg.data.split(strings.inlineSeparator)[1];
  dbmanager.findReviewById(reviewId, ['toUser', 'byUser', 'job'])
    .then((review) => {
      review.resolveWay = 'Delete';
      review.save();
      deleteReview(review);
      refreshAllAdminReviewMessages(review, bot);
    });
});

eventEmitter.on(strings.adminNotifications.adminOkReviewInline, ({ msg, bot }) => {
  const reviewId = msg.data.split(strings.inlineSeparator)[1];

  //  Everything is ok so we just clear all messages
  dbmanager.findReviewById(reviewId, ['toUser', 'byUser', 'job'])
    .then((review) => {
      review.resolveWay = 'Ok';
      review.save();
      refreshAllAdminReviewMessages(review, bot);
    });
});

/**
 * This function should be called after any button pressed
 * [OK] [BAN] [DELETE] - anyone of those should hide all buttons
 *
 * @param review - Mongoose Object
 * @param bot
 */
function refreshAllAdminReviewMessages(review, bot) {
  const messages = review.inlineMessages;
  const text = formNewReviewMessageText(review);

  messages.forEach(messageInfo => {
    const data = messageInfo.split('+');

    bot.editMessageText(text, {
      message_id: data[0],
      chat_id: data[1],
      keyboard: JSON.stringify({ inline_keyboard: [] }),
      disable_web_page_preview: 'true',
    }).catch((err) => { console.error(err.message); });
  });
}
/**
 * @param review - Mongoose Object
 */
function deleteReview(review) {
  let user = review.toUser;

  user.reviews.remove(review._id);
  user.save();
  user.updateRate();
}

/**
 * @param user - mongoose Object or Id
 */
function banUser(user) {
  if (!user.username) {
    dbmanager.findUserById(user)
      .then((user) => {
        user.ban_state = true;
        user.save();
      });
  } else {
    user.ban_state = true;
    user.save();
  }
}
