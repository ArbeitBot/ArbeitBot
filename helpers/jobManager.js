/**
 * Handles thw whole life cycle of job after creation: from showing a list 
 * of available freelancers to client to rating client and freelancer
 * Please see docs/job_process.txt to get better idea on job life cycle
 */

let keyboards = require('./keyboards');
let dbmanager = require('./dbmanager');
let strings = require('./strings');

/** Main functions */

/**
 * Sending a message to client after job has been created; message includes inline with freelancers available and suitalbe for this job
 * @param  {Mongoose:User} user Owner of this job
 * @param  {Telegram:Bot} bot  Bot that should send message
 * @param  {Mongoose:Job} job  Relevant job
 */
function sendJobCreatedMessage(user, bot, job) {
  // todo: handle if user doesn't have username
  function sendKeyboard(freelancers) {
    keyboards.sendKeyboard(bot,
      user.id,
      strings.pickFreelancersMessage, 
      keyboards.clientKeyboard,
      (data => {
        keyboards.sendInline(
          bot,
          user.id,
          messageFromFreelancers(freelancers),
          jobInlineKeyboard(freelancers, job));
      }));
  };

  dbmanager.freelancersForJob(job)
    .then(users => {
      sendKeyboard(users);
    });
}

function writeReview(bot, msg, job, user, data, reviewTypes) {
  let byClient = (reviewTypes === strings.reviewTypes.byClient);
  let chat_id = (byClient) ? job.current_inline_chat_id : job.freelancer_inline_chat_id;
  let message_id = (byClient) ? job.current_inline_message_id : job.freelancer_inline_message_id;

  if (data[4] === undefined) {
    let keyboard = (byClient) ? clientRateInlineKeyboard(job._id) : freelancerRateInlineKeyboard(job._id);

    let send = {
      chat_id: chat_id,
      message_id: message_id,
      text: (byClient) ? strings.rateFreelancerMessage : strings.rateClientMessage,
      reply_markup: {
        inline_keyboard: keyboard
      }
    };
    send.reply_markup = JSON.stringify(send.reply_markup);

    bot.editMessageText(send)
    .catch(err => {
      if (err.error.description !== 'Bad Request: message is not modified') {
        console.log(err);
      }
    });
  } else if (data[4] === strings.rateOptions.back) {
    if (byClient) {
      updateJobMessage(job, bot);
    } else {
      updateFreelancerMessage(bot, msg, user, job);
    }
  } else {
    let rate = data[4].length;
    /*if (data[4] === strings.rateOptions.oneStar) rate = 1;
     else if (data[4] === strings.rateOptions.twoStars) rate = 2;
     else if (data[4] === strings.rateOptions.threeStars) rate = 3;
     else if (data[4] === strings.rateOptions.fourStars) rate = 4;
     else if (data[4] === strings.rateOptions.fiveStars) rate = 5;*/
    let toUser = (byClient) ? job.selectedCandidate : job.client;

    dbmanager.addReview({
      byUser: user._id,
      toUser: toUser,
      job: job._id,
      rate: rate,
      review: '',
      reviewType: reviewTypes
    })
      .then(dbReviewObject => {
        dbmanager.findUserById(toUser)
          .then(toUser => {
            toUser.reviews.push(dbReviewObject._id);
            toUser.save()
              .then(toUser => {
                //todo: Send a message stating that you have received a review
              });
          });

        user.writeReview.push(dbReviewObject._id);
        user.save()
          .then(user => {
            let send = {
              chat_id: chat_id,
              message_id: message_id,
              text: strings.thanksReviewMessage,
              reply_markup: {
                inline_keyboard: []
              }
            };
            send.reply_markup = JSON.stringify(send.reply_markup);
            bot.editMessageText(send)
            .catch(err => {
              if (err.error.description !== 'Bad Request: message is not modified') {
                console.log(err);
              }
            });
          });
      });
  }
}

/** Handles */

/**
 * Handles inline when client selects a freelancer (that should receive a job offer from client later on) from the list of available freelancers; also handles option when sending to all freelancers
 * @param  {Telegram:Bot} bot Bot that should respond
 * @param  {Telegram:Messager} msg Message received
 */
function handleClientInline(bot, msg) {
  // Get essential info
  let options = msg.data.split(strings.inlineSeparator);
  let freelancerId = options[1];
  let jobId = options[2];
  // Check if select all touched
  if (freelancerId === strings.jobSendAllFreelancers) {
    dbmanager.freelancersForJobId(jobId)
      .then(users => {
        addFreelancersToCandidates(jobId, users, msg, bot);
      });
  } else if (freelancerId === strings.jobSelectFreelancer) {
    dbmanager.findJobById(jobId, 'interestedCandidates')
      .then(job => {
        showSelectFreelancers(msg, job, bot);
      });
  } else if (freelancerId === strings.jobFinishedOptions.report) {
    dbmanager.findJobById(jobId)
      .then(job => {
        dbmanager.findUserById(options[3])
          .then(user => {
            reportFreelancer(bot, msg, job, user);
          });
      });
  } else if (freelancerId === strings.jobFinishedOptions.rate) {
    dbmanager.findJobById(jobId)
      .then(job => {
        dbmanager.findUserById(job.client)
          .then(user => {
            writeReview(bot, msg, job, user, options, strings.reviewTypes.byClient);
          });
      });
  } else {
    dbmanager.findUserById(freelancerId)
      .then(user => {
        addFreelancersToCandidates(jobId, [user], msg, bot);
      });
  }
}

/**
 * Handles case when freelancer should be selected for job from client
 * @param  {Telegram:Bot} bot Bot that should respond
 * @param  {Telegram:Messager} msg Message received
 */
function handleSelectFreelancerInline(bot, msg) {
  // Get essential info
  let freelancerId = msg.data.split(strings.inlineSeparator)[1];
  let jobId = msg.data.split(strings.inlineSeparator)[2];

  if (freelancerId === strings.selectFreelancerCancel) {
    dbmanager.findJobById(jobId)
      .then(job => {
        updateJobMessage(job, bot);
      });
  } else if (freelancerId === strings.selectAnotherFreelancerInline) {
    selectAnotherFreelancerForJob(bot, jobId);
  } else {
    selectFreelancerForJob(bot, msg, freelancerId, jobId);
  }
}

/**
 * Handles freelancer inline answer whether he is interested ot not or wanr to report
 * @param  {Telegram:Bot} bot Bot that should respond
 * @param  {Telegram:Message} msg Message that was sent with this inline
 */
function handleFreelancerAnswerInline(bot, msg) {
  let options = msg.data.split(strings.inlineSeparator);
  let jobId = options[1];
  let answer = options[2];

  if (answer === strings.jobFinishedOptions.rate) {
    dbmanager.findJobById(jobId)
      .then(job => {
        dbmanager.findUserById(job.selectedCandidate)
          .then(user => {
            writeReview(bot, msg, job, user, options, strings.reviewTypes.byFreelancer);
          });
      });
  } else {
    let freelancerUsername = options[3];

    dbmanager.findJobById(jobId)
      .then(job => {
        dbmanager.findUser({ username: freelancerUsername })
          .then(user => {
            if (answer === strings.freelancerOptions.interested) {
              makeInterested(true, bot, msg, job, user);
            } else if (answer === strings.freelancerOptions.notInterested) {
              makeInterested(false, bot, msg, job, user);
            } else if (answer === strings.freelancerOptions.report) {
              reportJob(bot, msg, job, user);
            } else if (answer === strings.freelancerAcceptOptions.accept) {
              makeAccepted(true, bot, msg, job, user);
            } else if (answer === strings.freelancerAcceptOptions.refuse) {
              makeAccepted(false, bot, msg, job, user);
            }
          });
      });
  }
}

/**
//// Client side
*/

// Functions

/**
 * Sends freelancers job offer (description; inlines: interested, not interested, report); also adds freelancers to candidates of job
 * @param  {Telegram:Bot} bot Bot that should send message
 * @param  {[Mongoose:User]} users Users that should receive job offer
 * @param  {Mongoose:Job} job Job that freelancers are offered
 */
function sendUsersJobOffer(bot, users, job) {
  if (users === strings.selectAnotherFreelancerInline) {
    let send = {
      chat_id: job.freelancer_inline_chat_id,
      message_id: job.freelancer_inline_message_id,
      text: strings.clientHasChosenAnotherFreelancer,
      reply_markup: {
        inline_keyboard: []
      }
    };
    send.reply_markup = JSON.stringify(send.reply_markup);
    bot.editMessageText(send)
    .catch(err => console.log(err));
  } else if (job.state === strings.jobStates.searchingForFreelancer) {
    for (let i in users) {
      let user = users[i];
        let keyboard = [];
        let keys = Object.keys(strings.freelancerOptions);
        for (let j in keys) {
          let option = strings.freelancerOptions[keys[j]];
          keyboard.push([{
            text: option,
            callback_data:
            strings.freelancerJobInline +
            strings.inlineSeparator +
            job._id +
            strings.inlineSeparator +
            option +
            strings.inlineSeparator +
            user.username
          }]);
        }
        keyboards.sendInline(bot, user.id, job.description, keyboard);
    }
  } else if (job.state === strings.jobStates.freelancerChosen) {
    let user = users[0];

    let keyboard = [];
    let keys = Object.keys(strings.freelancerAcceptOptions);
    for (let i in keys) {
      let option = strings.freelancerAcceptOptions[keys[i]];
      keyboard.push([{
        text: option,
        callback_data:
        strings.freelancerJobInline +
        strings.inlineSeparator +
        job._id +
        strings.inlineSeparator +
        option +
        strings.inlineSeparator +
        user.username
      }]);
    }

    let message = {
      chat_id: user.id,
      text: job.description,
      reply_markup: {
        inline_keyboard: keyboard
      }
    };
    message.reply_markup = JSON.stringify(message.reply_markup);
    bot.sendMessage(message)
    .catch(err => console.log(err))
    .then(data => {
      job.freelancer_inline_chat_id = data.chat.id;
      job.freelancer_inline_message_id = data.message_id;
      job.save((err, newJob) => {
        if (err) {
          // todo: handle error
        }
      })
    });
  } else if (job.state === strings.jobStates.finished) {
    // todo: handle when job is finished
  }
}

/**
 * Called when client clicks button 'select contractors', edits existing job message with new inlines for selecting a contractor out of interested freelancers
 * @param  {Telegram:Message} msg Message to be editted
 * @param  {Mongoose:Job} job Job which message should be editted
 * @param  {Telegram:Bot} bot Bot that should edit message
 */
function showSelectFreelancers(msg, job, bot) {
  bot.editMessageText({
    chat_id: msg.message.chat.id,
    message_id: msg.message.message_id,
    reply_markup: JSON.stringify({
      inline_keyboard: jobSelectCandidateKeyboard(job)
    }),
    text: strings.selectCandidateMessage
  }).catch(err => console.log(err));
}

/**
 * Used to report a freelancer
 * @param  {Telegram:Bot} bot  Bot that sohuld respond
 * @param  {Telegram:Message} msg  Message that came with action
 * @param  {Mongoose:Job} job  Relevant to this report job
 * @param  {Mongoose:User} user User to be reported
 */
function reportFreelancer(bot, msg, job, user) {
  //  todo: handle report
}

// Management freelancers

/**
 * Used to add freelancers to this job candidates and sending them job offers
 * @param {Mongo:ObjectId} jobId Id of the job where to add candidates
 * @param {[Mongo:User]]} users Array of users to be added as candidates
 * @param {Telegram:Message} msg   Message that came along with inline action
 * @param {Telegram:Bot} bot   Bot that should response
 * @param {Mongoose:Job} job   (Optional) pass a job if you have any so that bot doesn't have to fetch job by Job id from db
 */
function addFreelancersToCandidates(jobId, users, msg, bot, job) {
  function jobCallback(job) {
    if (job) {
      users = users.filter((user) => {
        return !job.candidates || (job.candidates.indexOf(user._id) === -1 && job.interestedCandidates.indexOf(user._id) === -1 && job.notInterestedCandidates.indexOf(user._id) === -1);
      });
      job.current_inline_chat_id = msg.message.chat.id;
      job.current_inline_message_id = msg.message.message_id;
      users.forEach(user => job.candidates.push(user));
      job.save((err, newJob) => {
        if (err) {
          // todo: handle error
        } else {
          sendUsersJobOffer(bot, users, newJob);
          updateJobMessage(newJob, bot);
        }
      });
    } else {
      // todo: handle error
    }
  }
  if (job) {
    jobCallback(job);
  } else {
    dbmanager.findJobById(jobId)
      .then(newJob => {
        jobCallback(newJob);
      });
  }
}

/**
 * Selects a particular freelancer to 'selectedFreelancer' field of job, sends freelancer relevant message and edit client's job message
 * @param  {Telegram:Bot} bot    Bot that should response
 * @param  {Telegram:Message} msg    Message that was received with inline action
 * @param  {Mongo:ObjectId} userId User id of user to be selected
 * @param  {Mongo:ObjectId} jobId  Job id of job wherre freelancer is selected
 */
function selectFreelancerForJob(bot, msg, userId, jobId) {
  dbmanager.findJobById(jobId)
    .then(job => {
      dbmanager.findUserById(userId)
        .then(user => {
          job.selectedCandidate = user._id;
          job.state = strings.jobStates.freelancerChosen;
          job.save()
            .then(newJob => {
                updateJobMessage(newJob, bot);
                sendUsersJobOffer(bot, [user], newJob);
            })
        });
    });
}

/**
 * In case if freelancer has been selected by mistake or if freelancer doesn't respond, this function is called to select a different freelancer
 * @param  {Telegram:Bot} bot Bot that should respond
 * @param  {Mongo:ObjectId} jobId Id of relevant job
 */
function selectAnotherFreelancerForJob(bot, jobId) {
  dbmanager.findJobById(jobId)
    .then(job => {
      dbmanager.findUserById(job.selectedCandidate)
        .then(user => {
          job.selectedCandidate = null;
          job.state = strings.jobStates.searchingForFreelancer;
          job.save()
            .then(newJob => {
              updateJobMessage(newJob, bot);
              sendUsersJobOffer(bot, strings.selectAnotherFreelancerInline, newJob);
            })
        });
    });
}

// Update message

/**
 * Used to update job message with relevant inlines; uses updateJobMessageForSearch, updateJobMessageForSelected and updateJobMessageForFinished respectively
 * @param  {Mongoose:Job} job Job which message is going to be updated
 * @param  {Telegram:Bot} bot Bot that should update message
 */
function updateJobMessage(job, bot) {
  if (job.state === strings.jobStates.searchingForFreelancer) {
    updateJobMessageForSearch(job, bot);
  } else if (job.state === strings.jobStates.freelancerChosen) {
    updateJobMessageForSelected(job, bot);
  } else if (job.state === strings.jobStates.finished) {
    updateJobMessageForFinished(job, bot);
  }
}

/**
 * Updates job message with a list of available Freelancers
 * @param  {Mongoose:Job} job Job which message should be updated
 * @param  {Telegram:Bot} bot Bot that should update message
 */
function updateJobMessageForSearch(job, bot) {
  function updateKeyboard(users) {
    let send = {
      chat_id: job.current_inline_chat_id,
      message_id: job.current_inline_message_id,
      text: messageFromFreelancers(users),
      reply_markup: {
        inline_keyboard: jobInlineKeyboard(users, job)
      }
    };
    send.reply_markup = JSON.stringify(send.reply_markup);
    bot.editMessageText(send)
    .catch(err => {
      if (err.error.description !== 'Bad Request: message is not modified') {
        console.log(err);
      }
    });
  }

  dbmanager.freelancersForJob(job)
    .then(users => {
      updateKeyboard(users);
    });
}

/**
 * Updates job message when freelancer was already selected
 * @param  {Mongoose:Job} job Job which message should be updated
 * @param  {Telegram:Bot} bot Bot that should update message
 */
function updateJobMessageForSelected(job, bot) {
  let send = {
    chat_id: job.current_inline_chat_id,
    message_id: job.current_inline_message_id,
    text: strings.waitContractorResponseMessage,
    reply_markup: {
      inline_keyboard: [[{
        text: strings.jobSelectAnotherFreelancer,
        callback_data:
        strings.selectFreelancerInline +
        strings.inlineSeparator +
        strings.selectAnotherFreelancerInline +
        strings.inlineSeparator +
        job._id
      }]]
    }
  };
  send.reply_markup = JSON.stringify(send.reply_markup);
  bot.editMessageText(send)
  .catch(err => {
    if (err.error.description !== 'Bad Request: message is not modified') {
      console.log(err);
    }
  });
}

/**
 * Updates job message when job is finished
 * @param  {Mongoose:Job} job Job which message should be updated
 * @param  {Telegram:Bot} bot Bot that should update message
 */
function updateJobMessageForFinished(job, bot) {
  dbmanager.findUserById(job.selectedCandidate)
    .then(user => {
      let keyboard = [[{
          text: strings.jobFinishedOptions.rate,
          callback_data: strings.freelancerInline + strings.inlineSeparator + strings.jobFinishedOptions.rate + strings.inlineSeparator + job._id
        },
        {
          text: strings.jobFinishedOptions.report,
          callback_data: strings.freelancerInline + strings.inlineSeparator + strings.jobFinishedOptions.report + strings.inlineSeparator + job._id + strings.inlineSeparator + user._id
        }
      ]];

      let send = {
        chat_id: job.current_inline_chat_id,
        message_id: job.current_inline_message_id,
        text: `${strings.contactWithFreelancerMessage} @${user.username}`,
        reply_markup: {
          inline_keyboard: keyboard
        }
      };
      send.reply_markup = JSON.stringify(send.reply_markup);
      bot.editMessageText(send)
      .catch(err => {
        if (err.error.description !== 'Bad Request: message is not modified') {
          console.log(err);
        }
      });
    });
}

// Keyboards

/**
 * Getting a keyboard with freelancers for job; interested candidates on top
 * @param  {[Mongoose:User]} freelancers List of freelancers to display
 * @param  {Mongoose:Job} job         Job for which this keyboard should be made
 * @return {Telegram:InlineKeyboard}             Keyboard ready to be shown
 */
function jobInlineKeyboard(freelancers, job) {
  let keyboard = [];
  if (job.interestedCandidates.length > 0) {
    keyboard.push([{
      text: strings.jobSelectFreelancer,
      callback_data:
      strings.freelancerInline +
      strings.inlineSeparator +
      strings.jobSelectFreelancer +
      strings.inlineSeparator +
      job._id
    }]);
  }
  keyboard.push([{
    text: strings.jobSendAllFreelancers,
    callback_data:
    strings.freelancerInline +
    strings.inlineSeparator +
    strings.jobSendAllFreelancers +
    strings.inlineSeparator +
    job._id
  }]);
  freelancers.forEach(freelancer => {
    // Get postfix
    var postfix = '';
    if (job.candidates.indexOf(freelancer._id) > -1) {
      postfix = strings.pendingOption;
    } else if (job.interestedCandidates.indexOf(freelancer._id) > -1) {
      postfix = strings.interestedOption;
    }
    // Add freelancer button
    keyboard.push([{
      text: freelancer.username + ' ' + postfix,
      callback_data:
      strings.freelancerInline +
      strings.inlineSeparator +
      freelancer._id +
      strings.inlineSeparator +
      job._id
    }]);
  });
  return keyboard;
}

/**
 * Getting an inline keyboard with interested candidates to select a candidate for job
 * @param  {Mongoose:Job} job Job for which this keyboard should be created
 * @return {Telegram:InlineKeyboard}     Keyboard ready to be shown
 */
function jobSelectCandidateKeyboard(job) {
  let keyboard = [];
  keyboard.push([{
    text: strings.selectFreelancerCancel,
    callback_data:
    strings.selectFreelancerInline +
    strings.inlineSeparator +
    strings.selectFreelancerCancel +
    strings.inlineSeparator +
    job._id
  }]);
  job.interestedCandidates.forEach(freelancer => {
    keyboard.push([{
      text: freelancer.username,
      callback_data:
      strings.selectFreelancerInline +
      strings.inlineSeparator +
      freelancer._id +
      strings.inlineSeparator +
      job._id
    }]);
  });
  return keyboard;
}

function clientRateInlineKeyboard(jobId) {
  let keyboard = [];
  let keys = Object.keys(strings.rateOptions);
  for (let j in keys) {
    let option = strings.rateOptions[keys[j]];
    keyboard.push([{
      text: option,
      callback_data: strings.freelancerInline +
      strings.inlineSeparator +
      strings.jobFinishedOptions.rate +
      strings.inlineSeparator +
      jobId +
      strings.inlineSeparator +
      strings.reviewTypes.byFreelancer +
      strings.inlineSeparator +
      option
    }]);
  }

  return keyboard;
}

// Helpers

/**
 * Constructs a string from freelancers in format: userhandle, bio \n userhandle2, bio2 ...
 * @param  {[Mongoose:User]]} users A list of freelancers for which this message should be created
 * @return {String}       Message constructed from given users
 */
function messageFromFreelancers(users) {
  // todo: handle if user doesn't have username
  var message = '';
  for (var i in users) {
    var user = users[i];
    message = message + (i == 0 ? '' : '\n') + '@' + user.username + '\n' + user.bio;
  }
  return message;
}

/**
//// End client side
*/

/**
//// Freelancers side
*/

// Functions

/**
 * Adds freelancer to list of interested or not interested candidates of given job
 * @param  {Boolean} interested If true, adds candidate to the list of interested candidates, otherwise to list of not interested candidates
 * @param  {Telegram:Bot} bot        Bot that should respond
 * @param  {Telegram:Message} msg        Message that came along with inline action
 * @param  {Mongoose:Job} job        Job where to add freelancer
 * @param  {Mongoose:User} user       Freelancer object to add to job list
 */
function makeInterested(interested, bot, msg, job, user) {
  if (job.state !== strings.jobStates.searchingForFreelancer) {
    var send = {
      chat_id: msg.from.id,
      message_id: msg.message.message_id,
      text: strings.clientHasChosenAnotherFreelancer,
      reply_markup: {
        inline_keyboard: []
      }
    };
    send.reply_markup = JSON.stringify(send.reply_markup);
    bot.editMessageText(send)
    .catch(err => console.log(err));
  } else {
    // Remove user from candidates
    var candIndex = job.candidates.indexOf(user._id);
    var intIndex = job.interestedCandidates.indexOf(user._id);
    var notIntIndex = job.notInterestedCandidates.indexOf(user._id);
    if (candIndex > -1) {
      job.candidates.splice(candIndex, 1);
    }
    if (intIndex > -1) {
      job.interestedCandidates.splice(intIndex, 1);
    }
    if (notIntIndex > -1) {
      job.notInterestedCandidates.splice(notIntIndex, 1);
    }
    // Add user to interesed or not interested
    if (interested) {
      job.interestedCandidates.push(user._id);
    } else {
      job.notInterestedCandidates.push(user._id);
    }
    job.save((err, newJob) => {
      if (err) {
        // todo: handle error
      } else {
        updateJobMessage(newJob, bot);
        updateFreelancerMessage(bot, msg, user, newJob);
      }
    });
  }
}

/**
 * Adds/removes user to/from field "selected candidate" of given job
 * @param  {Boolean} accept If true sets freelancer as selected candidate for job, otherwise removes him
 * @param  {Telegram:Bot} bot    Bot that should respond
 * @param  {Telegram:Message} msg    Message that came with inline action
 * @param  {Mongoose:Job} job    Job where to add freelancer
 * @param  {Mongoose:User} user   Freelancer to operate with
 */
function makeAccepted(accept, bot, msg, job, user) {
  var intIndex = job.interestedCandidates.indexOf(user._id);

  if (''+job.selectedCandidate === ''+user._id) {
    if (!accept) {
      job.selectedCandidate = null;

      if (intIndex > -1) {
        job.interestedCandidates.splice(intIndex, 1);
      }

      job.notInterestedCandidates.push(user._id);
    }

    job.state = (accept) ? strings.jobStates.finished : strings.jobStates.freelancerChosen;

    job.save((err, newJob) => {
      updateFreelancerMessage(bot, msg, user, newJob);
      updateJobMessage(job, bot);
    });
  } else {
    var send = {
      chat_id: msg.from.id,
      message_id: msg.message.message_id,
      text: strings.clientHasChosenAnotherFreelancer,
      reply_markup: {
        inline_keyboard: []
      }
    };
    send.reply_markup = JSON.stringify(send.reply_markup);
    bot.editMessageText(send)
    .catch(err => console.log(err));
  }
}

/**
 * Initializes job report
 * @param  {Telegram:Bot} bot  Bot that should respond
 * @param  {Telegram:Message} msg  Message passed with action
 * @param  {Mongoose:Job} job  Job object to report
 * @param  {Mongoose:User} user User who reports
 */
function reportJob(bot, msg, job, user) {
  // user.input_state = strings.inputReportMessage;
  // user.report_draft = job._id;
  // user.save(err => {
  //   if (!err) {
  //     bot.sendMessage({
  //       chat_id: msg.from.id,
  //       text: strings.report.reason
  //     });
  //     makeInterested(false, bot, msg, job, user);
  //     updateJobMessage(job, bot);
  //     updateFreelancerMessage(bot, msg, user, job);
  //   }
  // });
}

// Update message

/**
 * Used to update job messahe from freelancer side; uses updateFreelancerMessageForSearch, updateFreelancerMessageForSelected and updateFreelancerMessageForFinished respectively
 * @param  {Telegram:Bot} bot  Bot that should edit message
 * @param  {Telegram:Message} msg  Message that came along with action
 * @param  {Mongoose:User} user Freelancer whos message should be editted
 * @param  {Mongoose:Job} job  Relevant job
 */
function updateFreelancerMessage(bot, msg, user, job) {
  if (job.state === strings.jobStates.searchingForFreelancer) {
    updateFreelancerMessageForSearch(bot, msg, user, job);
  } else if (job.state === strings.jobStates.freelancerChosen) {
    updateFreelancerMessageForSelected(bot, msg, user, job);
  } else if (job.state === strings.jobStates.finished) {
    updateFreelancerMessageForFinished(bot, msg, user, job);
  }
}

/**
 * Updates freelancer's job message with buttons 'interested' and 'not interested'
 * @param  {Telegram:Bot} bot  Bot that should edit message
 * @param  {Telegram:Message} msg  Message that came along with action
 * @param  {Mongoose:User} user Freelancer whos message should be editted
 * @param  {Mongoose:Job} job  Relevant job
 */
function updateFreelancerMessageForSearch(bot, msg, user, job) {
  let prefix = 'chacha';
  if (job.interestedCandidates.indexOf(user._id) > -1) {
    prefix = `${strings.interestedOption} ${strings.freelancerOptions.interested}\n\n`;
  } else if (job.notInterestedCandidates.indexOf(user._id) > -1) {
    prefix = `${strings.notInterestedOption} ${strings.freelancerOptions.notInterested}\n\n`;
  }

  let send = {
    chat_id: msg.message.chat.id,
    message_id: msg.message.message_id,
    text: `${prefix}\n\n${job.description}`,
    reply_markup: {
      inline_keyboard: []
    }
  };

  send.reply_markup = JSON.stringify(send.reply_markup);
  bot.editMessageText(send)
  .catch(err => {
    if (err.error.description !== 'Bad Request: message is not modified') {
      console.log(err);
    }
  });
}

/**
 * Updates freeelancer's job message when job's state is 'freelancer selected'
 * @param  {Telegram:Bot} bot  Bot that should edit message
 * @param  {Telegram:Message} msg  Message that came along with action
 * @param  {Mongoose:User} user Freelancer whos message should be editted
 * @param  {Mongoose:Job} job  Relevant job
 */
function updateFreelancerMessageForSelected(bot, msg, user, job) {
  if (job.state == strings.jobStates.freelancerChosen) {
    let prefix = `${strings.refuseOption} ${strings.freelancerAcceptOptions.refuse}`;

    let send = {
      chat_id: msg.message.chat.id,
      message_id: msg.message.message_id,
      text: `${prefix}\n\n${job.description}`,
      reply_markup: {
        inline_keyboard: []
      }
    };

    send.reply_markup = JSON.stringify(send.reply_markup);
    bot.editMessageText(send)
    .catch(err => {
      if (err.error.description !== 'Bad Request: message is not modified') {
        console.log(err);
      }
    })
    .then(data => {
      job.freelancer_inline_chat_id = data.chat.id;
      job.freelancer_inline_message_id = data.message_id;
      job.save((err, newJob) => {
        if (err) {
          // todo: handle error
        }
      })
    });

    job.state = strings.jobStates.searchingForFreelancer;
    job.save((err, newJob) => {
      //updateJobMessage(newJob, bot);
    });
  }
}

/**
 * Updates freeelancer's job message when job's state is 'job finished'
 * @param  {Telegram:Bot} bot  Bot that should edit message
 * @param  {Telegram:Message} msg  Message that came along with action
 * @param  {Mongoose:User} user Freelancer whos message should be editted
 * @param  {Mongoose:Job} job  Relevant job
 */
function updateFreelancerMessageForFinished(bot, msg, user, job) {
  let prefix = `${strings.acceptOption} ${strings.freelancerAcceptOptions.accept}\n${strings.waitClientResponseMessage}`;

  let keyboard = [[{
      text: strings.jobFinishedOptions.rate,
      callback_data: strings.freelancerJobInline + strings.inlineSeparator + job._id + strings.inlineSeparator + strings.jobFinishedOptions.rate + strings.inlineSeparator + user._id
    },
    {
      text: strings.jobFinishedOptions.report,
      callback_data: strings.freelancerJobInline + strings.inlineSeparator + job._id + strings.inlineSeparator + strings.jobFinishedOptions.report + strings.inlineSeparator + user._id
    }
  ]];

  let send = {
    chat_id: msg.message.chat.id,
    message_id: msg.message.message_id,
    text: `${prefix}\n\n${job.description}`,
    reply_markup: {
      inline_keyboard: keyboard
    }
  };

  send.reply_markup = JSON.stringify(send.reply_markup);
  bot.editMessageText(send)
  .catch(err => {
    if (err.error.description !== 'Bad Request: message is not modified') {
      console.log(err);
    }
  });
}

// Keyboards

function freelancerRateInlineKeyboard(jobId) {
  let keyboard = [];
  let keys = Object.keys(strings.rateOptions);
  for (let j in keys) {
    let option = strings.rateOptions[keys[j]];
    keyboard.push([{
      text: option,
      callback_data: strings.freelancerJobInline +
      strings.inlineSeparator +
      jobId +
      strings.inlineSeparator +
      strings.jobFinishedOptions.rate +
      strings.inlineSeparator +
      strings.reviewTypes.byFreelancer +
      strings.inlineSeparator +
      option
    }]);
  }

  return keyboard;
}

/**
//// End Freelancers side
*/



// Exports
module.exports = {
  sendJobCreatedMessage,
  handleClientInline,
  handleSelectFreelancerInline,
  handleFreelancerAnswerInline
};