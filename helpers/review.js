const keyboards = require('./keyboards');
const dbmanager = require('./dbmanager');
const strings = require('./strings');

// Rating

/**
 * Handles case when client clicks rate option after job is finished
 * @param  {Telegram:Bot} bot Bot that should respond
 * @param  {Telegram:Messager} msg Message received
 */
eventEmitter.on(strings.askRateFreelancerInline, ({ msg, bot }) => {
  const jobId = msg.data.split(strings.inlineSeparator)[1];

  dbmanager.findJobById(jobId, 'selectedCandidate client')
    .then(job => {
      const freelancer = job.selectedCandidate;

      let keyboard = keyboards.rateKeyboard(strings.rateClientInline, job._id);
      let send = {
        chat_id: job.current_inline_chat_id,
        message_id: job.current_inline_message_id,
        text: strings.rateClientMessage,
        reply_markup: {
          inline_keyboard: keyboard
        }
      };
      send.reply_markup = JSON.stringify(send.reply_markup);
      bot.editMessageText(send)
        .catch(err => console.log(err.error.description));
    });
});

/**
 * Handles case when freelancer clicks rate option after job is finished
 * @param  {Telegram:Bot} bot Bot that should respond
 * @param  {Telegram:Messager} msg Message received
 */
eventEmitter.on(strings.askRateClientInline, ({ msg, bot }) => {
  const jobId = msg.data.split(strings.inlineSeparator)[1];
  const freelancerId = msg.data.split(strings.inlineSeparator)[2];

  dbmanager.findJobById(jobId, 'client freelancer_chat_inlines')
    .then(job => {
      dbmanager.findUserById(freelancerId)
        .then(freelancer => {
          let keyboard = keyboards.rateKeyboard(strings.rateFreelancerInline, job._id);
          const chatInline = dbmanager.chatInline(job, freelancer);
          let send = {
            chat_id: chatInline.chat_id,
            message_id: chatInline.message_id,
            text: strings.rateClientMessage,
            reply_markup: {
              inline_keyboard: keyboard
            }
          };
          send.reply_markup = JSON.stringify(send.reply_markup);
          bot.editMessageText(send)
            .catch(err => console.log(err.error.description));
        });
    });
});

/**
 * Handles case when client rates freelancer after job is done
 * @param  {Telegram:Bot} bot Bot that should respond
 * @param  {Telegram:Messager} msg Message received
 */
eventEmitter.on(strings.rateFreelancerInline, ({ msg, bot }) => {
  const rating = msg.data.split(strings.inlineSeparator)[1];
  const jobId = msg.data.split(strings.inlineSeparator)[2];

  dbmanager.findJobById(jobId, 'client freelancer_chat_inlines')
    .then(job => {
      dbmanager.findUserById(job.selectedCandidate)
        .then(freelancer => {
          writeReview(bot, job, rating, job.client, freelancer, strings.reviewTypes.byFreelancer);
        });
    });
});

/**
 * Handles case when freelancer rates client after job is done
 * @param  {Telegram:Bot} bot Bot that should respond
 * @param  {Telegram:Messager} msg Message received
 */
eventEmitter.on(strings.rateClientInline, ({ msg, bot }) => {
  const rating = msg.data.split(strings.inlineSeparator)[1];
  const jobId = msg.data.split(strings.inlineSeparator)[2];

  dbmanager.findJobById(jobId, 'client freelancer_chat_inlines')
    .then(job => {
      dbmanager.findUserById(job.selectedCandidate)
        .then(freelancer => {
          writeReview(bot, job, rating, job.client, freelancer, strings.reviewTypes.byClient);
        });
    });
});

/**
 * Adds review to client and freelancer user objects; clears message on user that rated
 * @param  {Telegram:Bot} bot        Bot that should respond
 * @param  {Mongoose:Job} job        Job about which the report is made
 * @param  {Number} rating     Rating 1-5 stars
 * @param  {Mongoose:User} client     Relevant client
 * @param  {Mongoose:User} freelancer Relevant freelancer
 * @param  {String} reviewType Type of review (client-freelancer or freelancer-client)
 */
function writeReview(bot, job, rating, client, freelancer, reviewType) {
  const byClient = (reviewType === strings.reviewTypes.byClient);
  const byUser = (byClient) ? client : freelancer;
  const toUser = (byClient) ? freelancer : client;
  const chatInline = dbmanager.chatInline(job, freelancer);
  const chat_id = (byClient) ? job.current_inline_chat_id : chatInline.chat_id;
  const message_id = (byClient) ? job.current_inline_message_id : chatInline.message_id;

  if ((job.reviewByClient && byClient) || (job.reviewByFreelancer && !byClient)) return;

  dbmanager.addReview({
    byUser: byUser,
    toUser: toUser,
    job: job._id,
    rate: rating,
    review: '',
    reviewType: reviewType
  })
    .then(dbReviewObject => {
      dbmanager.findUserById(toUser)
      .then(toUser => {
        toUser.reviews.push(dbReviewObject._id);
        toUser.rate += parseInt(rating);
        toUser.save()
          .then(toUser => {
            // todo: Send a message stating that you have received a review
          });
      });

      if (byClient) {
        job.reviewByClient = dbReviewObject._id;
      } else {
        job.reviewByFreelancer = dbReviewObject._id;
      }
      job.save();

      byUser.writeReview.push(dbReviewObject._id);
      byUser.save()
        .then(byUser => {
          let send = {
            chat_id: chat_id,
            message_id: message_id,
            text: `${job.description}\n\n${strings.thanksReviewMessage}`,
            reply_markup: {
              inline_keyboard: []
            }
          };
          send.reply_markup = JSON.stringify(send.reply_markup);
          bot.editMessageText(send)
            .catch(err => console.log(err.error.description));
        });
    });
}

// Exports
module.exports = {
    writeReview
};