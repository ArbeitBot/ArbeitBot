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
  sendRateKeyboard(msg, bot, strings.rateClientInline);
});

/**
 * Handles case when freelancer clicks rate option after job is finished
 * @param  {Telegram:Bot} bot Bot that should respond
 * @param  {Telegram:Messager} msg Message received
 */
eventEmitter.on(strings.askRateClientInline, ({ msg, bot }) => {
  sendRateKeyboard(msg, bot, strings.rateFreelancerInline);
});

/**
 * Handles case when client rates freelancer after job is done
 * @param  {Telegram:Bot} bot Bot that should respond
 * @param  {Telegram:Messager} msg Message received
 */
eventEmitter.on(strings.rateFreelancerInline, ({ msg, bot }) => {
  const rating = msg.data.split(strings.inlineSeparator)[1];
  const jobId = msg.data.split(strings.inlineSeparator)[2];

  writeReview(bot, jobId, rating, strings.reviewTypes.byFreelancer);
});

/**
 * Handles case when freelancer rates client after job is done
 * @param  {Telegram:Bot} bot Bot that should respond
 * @param  {Telegram:Messager} msg Message received
 */
eventEmitter.on(strings.rateClientInline, ({ msg, bot }) => {
  const rating = msg.data.split(strings.inlineSeparator)[1];
  const jobId = msg.data.split(strings.inlineSeparator)[2];

  writeReview(bot, jobId, rating, strings.reviewTypes.byClient);
});

function sendRateKeyboard(msg, bot, type) {
  const jobId = msg.data.split(strings.inlineSeparator)[1];

  dbmanager.findJobById(jobId, 'selectedCandidate')
    .then(job => {
      const user = job.selectedCandidate;
      const ratingMessage = user.reviews.length === 0 ? '' : ` ${user.GetRateStars()} (${user.reviews.length})`
      const specialSymbol = user.specialSymbol ? user.specialSymbol + ' ' : '';

      const rateClient = type !== strings.rateFreelancerInline;
      let message = rateClient ? strings.rateFreelancerMessage : strings.rateClientMessage;

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
        keyboards.rateKeyboard(type, job._id));
    });
}

/**
 * Adds review to client and freelancer user objects; clears message on user that rated
 * @param  {Telegram:Bot} bot        Bot that should respond
 * @param  {Mongoose:Job} job        Job about which the report is made
 * @param  {Number} rating     Rating 1-5 stars
 * @param  {Mongoose:User} client     Relevant client
 * @param  {Mongoose:User} freelancer Relevant freelancer
 * @param  {String} reviewType Type of review (client-freelancer or freelancer-client)
 */
function writeReview(bot, jobId, rating, reviewType) {
  dbmanager.findJobById(jobId, 'client freelancer_chat_inlines selectedCandidate')
    .then(job => {
      dbmanager.findUserById(job.selectedCandidate)
        .then(freelancer => {
          const byClient = (reviewType === strings.reviewTypes.byClient);
          const byUser = (byClient) ? job.client : freelancer;
          const toUser = (byClient) ? freelancer : job.client;
          const chatInline = dbmanager.chatInline(job, freelancer);
          const chat_id = (byClient) ? job.current_inline_chat_id : chatInline.chat_id;
          const message_id = (byClient) ? job.current_inline_message_id : chatInline.message_id;

          if ((job.reviewByClient && byClient) || (job.reviewByFreelancer && !byClient)) return;

          const ratingEmoji = strings.rateOptionsArray[rating-1];

          dbmanager.addReview({
            byUser: byUser,
            toUser: toUser,
            job: job._id,
            rate: rating,
            review: '',
            reviewType: reviewType
          })
            .then(dbReviewObject => {
              eventEmitter.emit(strings.newReview, { bot, dbReviewObject });
              dbmanager.findUserById(toUser)
              .then(toUser => {
                toUser.reviews.push(dbReviewObject._id);
                toUser.rate += parseInt(rating);
                toUser.save()
                  .then(toUser => {
                    let options = {
                      disable_web_page_preview: 'true'
                    };
                    
                    bot.sendMessage(toUser.id,
                      `${strings.youWereRated}@${byUser.username}\n${ratingEmoji}`,
                      options)
                      .catch(err => console.error(err.message));
                  });
              });

              if (byClient) {
                job.reviewByClient = dbReviewObject._id;
              } else {
                job.reviewByFreelancer = dbReviewObject._id;
              }

              if (job.reviewByClient && job.reviewByFreelancer) {
                job.state = strings.jobStates.rated;
              }

              job.save();

              byUser.writeReview.push(dbReviewObject._id);
              byUser.save()
                .then(byUser => {
                  let message;

                  if (byClient) {
                    const freelancer = job.selectedCandidate;
                    const ratingMessage = freelancer.reviews.length === 0 ? '' : ` ${freelancer.GetRateStars()} (${freelancer.reviews.length})`
                    const specialSymbol = freelancer.specialSymbol ? freelancer.specialSymbol + ' ' : '';
                    message = `[${job.category.title}]\n${job.description}\n\n${specialSymbol}@${freelancer.username}${ratingMessage}\n${freelancer.bio}\n\n${strings.thanksReviewMessage}\n${ratingEmoji}`;
                  } else {
                    message = `@${toUser.username}\n[${job.category.title}]\n${job.description}\n\n${strings.thanksReviewMessage}\n${ratingEmoji}`;
                  }
                  keyboards.editMessage(
                    bot,
                    chat_id,
                    message_id,
                    message,
                    []).catch(err => console.log(err));
                });
            });
        });
    });
}