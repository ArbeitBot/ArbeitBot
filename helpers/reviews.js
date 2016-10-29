/**
 * @module helpers/reviews
 * @license MIT
 */

/** Dependencies */
const dbmanager = require('./dbmanager');
const keyboards = require('./keyboards');
const strings = require('./strings');

/** Rating */

/**
 * Handles case when client clicks rate option after job is finished
 *
 * @param {Telegram:Bot} bot - Bot that should respond
 * @param {Telegram:Messager} msg - Message received
 */
global.eventEmitter.on(strings.askRateFreelancerInline, ({ msg, bot }) => {
  sendRateKeyboard(msg, bot, strings.rateClientInline);
});

/**
 * Handles case when freelancer clicks rate option after job is finished
 *
 * @param {Telegram:Bot} bot - Bot that should respond
 * @param {Telegram:Messager} msg - Message received
 */
global.eventEmitter.on(strings.askRateClientInline, ({ msg, bot }) => {
  sendRateKeyboard(msg, bot, strings.rateFreelancerInline);
});

/**
 * Handles case when client rates freelancer after job is done
 *
 * @param {Telegram:Bot} bot - Bot that should respond
 * @param {Telegram:Messager} msg - Message received
 */
global.eventEmitter.on(strings.rateFreelancerInline, ({ msg, bot }) => {
  const rating = msg.data.split(strings.inlineSeparator)[1];
  const jobId = msg.data.split(strings.inlineSeparator)[2];

  writeReview(bot, jobId, rating, strings.reviewTypes.byFreelancer);
});

/**
 * Handles case when freelancer rates client after job is done
 *
 * @param {Telegram:Bot} bot - Bot that should respond
 * @param {Telegram:Messager} msg - Message received
 */
global.eventEmitter.on(strings.rateClientInline, ({ msg, bot }) => {
  const rating = msg.data.split(strings.inlineSeparator)[1];
  const jobId = msg.data.split(strings.inlineSeparator)[2];

  writeReview(bot, jobId, rating, strings.reviewTypes.byClient);
});

/**
 * Function to send rate keyboard to sender of the message
 * @param {Telegram:Message} msg - Message that triggered this function
 * @param {Telegram:Bot} bot - Bot that should respond
 * @param {String} type - See strings.js, either freelancer rate inline or client's one
 */
function sendRateKeyboard(msg, bot, type) {
  const jobId = msg.data.split(strings.inlineSeparator)[1];

  dbmanager.findJobById(jobId, 'selectedCandidate')
    .then((job) => {
      const user = job.selectedCandidate;
      const ratingMessage = ((user.reviews.length) === 0 ?
        '' :
        ` ${user.getRateStars()} (${user.reviews.length})`
      );

      const specialSymbol = ((user.specialSymbol) ?
        `${user.specialSymbol} ` :
        ''
      );

      const rateClient = type !== strings.rateFreelancerInline;
      let message = ((rateClient) ?
        strings.rateFreelancerMessage :
        strings.rateClientMessage
      );

      if (rateClient) {
        message = `${message}\n\n${specialSymbol}@${user.username}${ratingMessage}\n${user.bio}`;
      } else {
        message = `${message}\n\n${specialSymbol}@${user.username}${ratingMessage}\n[${job.category.title}]\n${job.description}`;
      }

      keyboards.editMessage(
        bot,
        msg.message.chat.id,
        msg.message.message_id,
        message,
        keyboards.rateKeyboard(type, job._id)
      );
    })
    .catch(/** todo: handle error */);
}

/**
 * Adds review to client and freelancer user objects; clears message on user that rated
 *
 * @param {Telegram:Bot} bot - Bot that should respond
 * @param {Mongoose:Job} job - Job about which the report is made
 * @param {Number} rating - Rating 1-5 stars
 * @param {Mongoose:User} client - Relevant client
 * @param {Mongoose:User} freelancer - Relevant freelancer
 * @param {String} reviewType - Type of review (client-freelancer or freelancer-client)
 */
function writeReview(bot, jobId, rating, reviewType) {
  dbmanager.findJobById(jobId, 'client freelancer_chat_inlines selectedCandidate')
    .then(job =>
      dbmanager.findUserById(job.selectedCandidate)
        .then((freelancer) => {
          const byClient = (reviewType === strings.reviewTypes.byClient);
          const byUser = (byClient) ? job.client : freelancer;
          const toUser = (byClient) ? freelancer : job.client;
          const chatInline = dbmanager.chatInline(job, freelancer);
          const chatId = (byClient) ? job.current_inline_chat_id : chatInline.chat_id;
          const messageId = (byClient) ? job.current_inline_message_id : chatInline.message_id;

          if ((job.reviewByClient && byClient) || (job.reviewByFreelancer && !byClient)) return;

          const ratingEmoji = strings.rateOptionsArray[rating - 1];

          dbmanager.addReview({
            review: '',
            rate: rating,
            job: job._id,
            reviewType,
            byUser,
            toUser,
          })
            .then((dbReviewObject) => {
              global.eventEmitter.emit(strings.newReview, { bot, dbReviewObject });
              dbmanager.findUserById(toUser)
                .then((dbToUser) => {
                  const dbToUserCopy = Object.create(dbToUser);
                  dbToUserCopy.reviews.push(dbReviewObject._id);
                  dbToUserCopy.rate += parseInt(rating, 10);

                  if (parseInt(rating, 10) > 3) dbToUserCopy.positiveRate += 1;

                  dbToUserCopy.updateSortRate(false);
                  dbToUserCopy.save()
                    .then((savedUser) => {
                      const options = { disable_web_page_preview: 'true' };

                      bot.sendMessage(savedUser.id,
                        `${strings.youWereRated}@${byUser.username}\n${ratingEmoji}`,
                        options
                      ).catch(/** todo: handle error */);
                    })
                    .catch(/** todo: handle error */);
                })
                .catch(/** todo: handle error */);

              const jobCopy = Object.create(job);
              if (byClient) {
                jobCopy.reviewByClient = dbReviewObject._id;
              } else {
                jobCopy.reviewByFreelancer = dbReviewObject._id;
              }

              if (jobCopy.reviewByClient && jobCopy.reviewByFreelancer) {
                jobCopy.state = strings.jobStates.rated;
              }

              jobCopy.save();

              byUser.writeReview.push(dbReviewObject._id);
              byUser.save()
                .then(() => {
                  let message;

                  if (byClient) {
                    const selectedFreelancer = jobCopy.selectedCandidate;
                    const ratingMessage = ((selectedFreelancer.reviews.length === 0) ?
                      '' :
                      ` ${selectedFreelancer.getRateStars()} (${selectedFreelancer.reviews.length})`
                    );
                    const specialSymbol = ((selectedFreelancer.specialSymbol) ?
                      `${selectedFreelancer.specialSymbol} ` :
                      ''
                    );

                    message = `[${jobCopy.category.title}]\n${jobCopy.description}\n\n${specialSymbol}@${selectedFreelancer.username}${ratingMessage}\n${selectedFreelancer.bio}\n\n${strings.thanksReviewMessage}\n${ratingEmoji}`;
                  } else {
                    message = `@${toUser.username}\n[${jobCopy.category.title}]\n${jobCopy.description}\n\n${strings.thanksReviewMessage}\n${ratingEmoji}`;
                  }

                  keyboards.editMessage(
                    bot,
                    chatId,
                    messageId,
                    message,
                    []
                  ).catch(/** todo: handle error */);
                })
                .catch(/** todo: handle error */);
            })
            .catch(/** todo: handle error */);
        })
    )
    .catch(/** todo: handle error */);
}
