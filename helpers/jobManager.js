/**
 * Handles thw whole life cycle of job after creation: from showing a list 
 * of available freelancers to client to rating client and freelancer
 * Please see docs/job_process.txt to get better idea on job life cycle
 */

const keyboards = require('./keyboards');
const dbmanager = require('./dbmanager');
const strings = require('./strings');
const adminReports = require('./adminReports');
require('./reviews');
require('./reports');
require('./adminNotifications');

const mongoose = require('mongoose');
const Job = mongoose.model('job');

const eventEmitter = global.eventEmitter;

/** Main functions */

/**
 * Sending a message to client after job has been created; message includes inline with 
 * freelancers available and suitalbe for this job
 * @param  {Mongoose:User} user Owner of this job
 * @param  {Telegram:Bot} bot  Bot that should send message
 * @param  {Mongoose:Job} job  Relevant job
 */
function sendJobCreatedMessage(user, bot, job) {
  dbmanager.freelancersForJob(job)
    .then((users) => {
      keyboards.sendKeyboard(bot,
        user.id,
        strings.pickFreelancersMessage,
        keyboards.clientKeyboard,
        (data) => {
          keyboards.sendInline(
            bot,
            user.id,
            '[' + job.category.title + ']' + '\n' +
              job.description + '\n\n' +
              messageFromFreelancers(users),
              jobInlineKeyboard(users, job),
            (data2) => {
              job.current_inline_chat_id = data2.chat.id;
              job.current_inline_message_id = data2.message_id;
              job.save();
            });
        });
    });
}

/**
 * Used to send user all his jobs that aren't yet closed; deletes previous existing job cards; sends no jobs message if no jobs exist for this user
 * @param  {Telegram:Bot} bot Bot that should send cards
 * @param  {Telegram:Message} msg Message that came with this command
 */
function sendAllJobs(bot, msg) {
  dbmanager.findUser({ id: msg.from.id })
    .then(user => {
      if (user.jobs.length <= 0) {
        keyboards.sendInline(bot, user.id, strings.noJobsExistMessage, [])
          .catch(err => console.error(err.message));
      } else {
        sendJobMessages(user, bot);
      }
    });
}

/** Handles */

// Job process

/**
 * Handles inline when client selects a freelancer (that should receive a job offer from client later on) from the list of available freelancers; also handles option when sending to all freelancers
 * @param  {Telegram:Bot} bot Bot that should respond
 * @param  {Telegram:Messager} msg Message received
 */
eventEmitter.on(strings.freelancerInline, ({ msg, bot }) => {
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
  } else {
    dbmanager.findUserById(freelancerId)
      .then(user => {
        addFreelancersToCandidates(jobId, [user], msg, bot);
      });
  }
});

eventEmitter.on(strings.jobManageInline, ({ msg, bot }) => {
  // Get essential info
  let options = msg.data.split(strings.inlineSeparator);
  let answer = options[1];
  let jobId = options[2];

  if (answer === strings.jobRefresh) {
    dbmanager.findJobById(jobId)
      .then(job => {
        updateJobMessage(job, bot);
      });
  } else if (answer === strings.jobEdit) {
    console.log(strings.jobEdit);
  } else if (answer === strings.jobDelete) {
    dbmanager.findJobById(jobId, 'interestedCandidates')
      .then(job => {
        job.state = strings.jobStates.removed;
        job.save()
          .then(job => {
            updateJobMessage(job, bot);
          });
      });
  }
});

/**
 * Handles freelancer inline answer whether he is interested ot not or want to report
 * @param  {Telegram:Bot} bot Bot that should respond
 * @param  {Telegram:Message} msg Message that was sent with this inline
 */
eventEmitter.on(strings.freelancerJobInline, ({ msg, bot }) => {
  let options = msg.data.split(strings.inlineSeparator);
  let jobId = options[1];
  let answer = options[2];
  let freelancerUsername = options[3];

  dbmanager.findJobById(jobId)
    .then(job => {
      dbmanager.findUser({ username: freelancerUsername })
        .then(user => {
          dbmanager.saveFreelancerMessageToJob(msg, job, user)
            .then(job => {
              if (answer === strings.freelancerOptions.interested) {
                makeInterested(true, bot, msg, job, user);
              } else if (answer === strings.freelancerOptions.notInterested) {
                makeInterested(false, bot, msg, job, user);
              }
            });
        });
    });
});

/**
 * Handles case when freelancer should be selected for job from client
 * @param  {Telegram:Bot} bot Bot that should respond
 * @param  {Telegram:Messager} msg Message received
 */
eventEmitter.on(strings.selectFreelancerInline, ({ msg, bot }) => {
  // Get essential info
  const freelancerId = msg.data.split(strings.inlineSeparator)[1];
  const jobId = msg.data.split(strings.inlineSeparator)[2];

  if (freelancerId === strings.selectFreelancerCancel) {
    dbmanager.findJobById(jobId)
      .then(job => {
        updateJobMessage(job, bot);
      });
  } else {
    selectFreelancerForJob(bot, msg, freelancerId, jobId);
  }
});

/**
 * Handles case when freelancer didn't respond yet and client would like to select another freelancer
 * @param  {Telegram:Bot} bot Bot that should respond
 * @param  {Telegram:Messager} msg Message received
 */
eventEmitter.on(strings.selectAnotherFreelancerInline, ({ msg, bot }) => {
  const jobId = msg.data.split(strings.inlineSeparator)[1];
  selectAnotherFreelancerForJob(bot, jobId);
});

/**
 * Handles case when freelancer accepts or rejects job offer
 * @param  {Telegram:Messager} msg Message received
 * @param  {Telegram:Bot} bot Bot that should respond
 */
eventEmitter.on(strings.freelancerAcceptInline, ({ msg, bot }) => {
  const jobId = msg.data.split(strings.inlineSeparator)[1];
  const option = msg.data.split(strings.inlineSeparator)[2];
  const freelancerUsername = msg.data.split(strings.inlineSeparator)[3];

  dbmanager.findJobById(jobId)
    .then(job => {
      if (job.state === strings.jobStates.freelancerChosen) {
        dbmanager.findUser({username: freelancerUsername})
          .then(user => {
            if (option === strings.freelancerAcceptOptions.accept) {
              job.state = strings.jobStates.finished;
              job.save()
                .then(job => {
                  updateJobMessage(job, bot);
                  updateFreelancerMessage(bot, msg, user, job);
                });
            } else {
              job.state = strings.jobStates.searchingForFreelancer;
              job.candidate = null;
              job.save()
                .then(job => {
                  makeInterested(false, bot, msg, job, user);
                });
            }
          });
      }
    });
});

eventEmitter.on(strings.inputCategoryNameState, ({ msg, user, bot }) => {
  if (msg.text.indexOf(' [') > -1) {
    let categoryTitle = msg.text.split(' [')[0];
    dbmanager.getCategories()
    .then(categories => {
      let filteredCategories = categories
      .filter(category => category.freelancers.length - (category.freelancers.find(f => f.id === user.id) ? 1 : 0) > 0)
      for (let i = 0; i < filteredCategories.length; i++) {
        const cat = filteredCategories[i];
        if (cat.title === categoryTitle) {
          startJobDraft(categoryTitle, msg, user, bot);
          break;
        }
      }
    });
  } else { console.log(msg); }
});

eventEmitter.on(strings.inputHourlyRateState, ({ msg, user, bot }) => {
  if (msg.text.indexOf(' [') > -1) {
    const hourlyRate = msg.text.split(' [')[0];
    const options = strings.hourlyRateOptions;
    if (options.includes(hourlyRate)) {
      addHourlyRateToJobDraft(hourlyRate, msg, user, bot);
    }
  } else { console.log(msg); }
});

eventEmitter.on(strings.inputJobDescriptionState, ({ msg, user, bot }) => {
  let description = msg.text.substring(0, 500);
  addDescriptionToJobDraft(description, msg, user, bot);
});


/**
 * Handles inline when job creation needs to be cancelled
 * @param  {Telegram:Bot} bot Bot that should respond
 * @param  {Telegram:Messager} msg Message received
 */
eventEmitter.on(strings.cancelJobCreationInline, ({ msg, bot }) => {
  // Get essential info
  let options = msg.data.split(strings.inlineSeparator);
  let userId = options[1];

  dbmanager.findUser({ id: userId })
  .then(user => {
    keyboards.editInline(bot, msg.message.chat.id, msg.message.message_id, []);
    cancelJobCreation(msg.message, user, bot);
  });
});

eventEmitter.on('cancel' + strings.inputCategoryNameState, ({ msg, user, bot }) => {
  cancelJobCreation(msg, user, bot);
});
eventEmitter.on('cancel' + strings.inputHourlyRateState, ({ msg, user, bot }) => {
  cancelJobCreation(msg, user, bot);
});
eventEmitter.on('cancel' + strings.inputJobDescriptionState, ({ msg, user, bot }) => {
  cancelJobCreation(msg, user, bot);
});

// Connectors

/**
 * Handles case when job message should be updated from outside
 * @param  {Mongoose:Job} job Job that should be updated
 * @param  {Telegram:Bot} bot Bot that should update message
 */
eventEmitter.on(strings.shouldUpdateJobMessage, ({ job, bot }) => {
  updateJobMessage(job, bot);
});

/**
 * Handles case when freelancer message should be updated from outside
 * @param  {Telegram:Bot} bot  Bot that should edit message
 * @param  {Telegram:Message} msg  Message that came along with action
 * @param  {Mongoose:User} user Freelancer whos message should be editted
 * @param  {Mongoose:Job} job  Relevant job
 */
eventEmitter.on(strings.shouldUpdateFreelancerMessage, ({ bot, msg, user, job }) => {
  updateFreelancerMessage(bot, msg, user, job);
});

/**
 * Handles case when user should be added to interested or not interested candidates from the outside
 * @param  {Boolean} interested If true, adds candidate to the list of interested candidates, otherwise to list of not interested candidates
 * @param  {Telegram:Bot} bot        Bot that should respond
 * @param  {Telegram:Message} msg        Message that came along with inline action
 * @param  {Mongoose:Job} job        Job where to add freelancer
 * @param  {Mongoose:User} user       Freelancer object to add to job list
 */
eventEmitter.on(strings.shouldMakeInterested, ({ interested, bot, msg, job, user }) => {
  makeInterested(interested, bot, msg, job, user);
});

/**
//// Client side
*/

// Functions

/**
 * Creates job draft for user
 * @param  {String} categoryTitle Title of job's category
 * @param  {Telegram:message} msg Message received
 * @param  {Mongoose:User} user Owner of job
 * @param  {Telegram:Bot} bot Bot that should respond
 */
function startJobDraft(categoryTitle, msg, user, bot) {
  dbmanager.getCategory(categoryTitle)
  .then(category => {
    if (!category) return;
    let draft = new Job({
      category: category,
      client: user,
      // todo: we shouldn't add user to list of not interested candidates initially, this hack should be addressed in future
      notInterestedCandidates: [user]
    });
    draft.save()
    .then(draft => {
      user.job_draft = draft;
      draft.save()
      .then(job => {
        askForNewJobPriceRange(msg, user, bot, job, category);
      });
    });
  })
}

/**
 * Cancels job creation, removes job draft and resets user's input state
 * @param  {Telegram:Message} msg  Message received
 * @param  {Mongoose:User} user Owner of job
 * @param  {Telegram:Bot} bot Bot that should respond
 */
function cancelJobCreation(msg, user, bot) {
  user.input_state = undefined;
  const tempJob = user.job_draft;
  user.job_draft = undefined;
  user.save()
  .then(user => {
    if (!!tempJob) {
      tempJob.remove((err, removed) => {
        keyboards.sendKeyboard(
            bot,
            msg.chat.id,
            strings.clientMenuMessage,
            keyboards.clientKeyboard);
      });
    } else {
      keyboards.sendKeyboard(
          bot,
          msg.chat.id,
          strings.clientMenuMessage,
          keyboards.clientKeyboard);
    }

  });
}

/**
 * Adds hourly rate to job draft and sends next step
 * @param {String} hourlyRate Picked hourly rate
 * @param {Telegram:Message} msg        Message received
 * @param {Mongoose:User} user       Job owner
 * @param {Telegram:Bot} bot        Bot that should respond
 */
function addHourlyRateToJobDraft(hourlyRate, msg, user, bot) {
  if (!strings.hourlyRateOptions.includes(hourlyRate)) return;

  user.job_draft.hourly_rate = hourlyRate;
  user.job_draft.save((err, draft) => {
    if (err) {
      // todo: handle error
    } else {
      askForNewJobDescription(msg, bot, user);
    }
  })
}

/**
 * Adds desctiption to job draft and sends next step
 * @param {String} description Description of job
 * @param {Telegram:Message} msg        Message received
 * @param {Mongoose:User} user       Job owner
 * @param {Telegram:Bot} bot        Bot that should respond
 */
function addDescriptionToJobDraft(description, msg, user, bot) {
  let jobDraft = user.job_draft;
  jobDraft.description = description;

  user.job_draft = undefined;
  user.jobs.push(jobDraft);
  user.input_state = undefined;
  jobDraft.save()
  .then(draft => {
    user.save()
    .then(user => {
      draft.populate('category', (err, job) => {
        adminReports.jobCreated(bot, job);
        sendJobCreatedMessage(user, bot, job);
      });
    });
  });
}

/**
 * Sends freelancers job offer (description; inlines: interested, not interested, report);
 * also adds freelancers to candidates of job
 * @param  {Telegram:Bot} bot Bot that should send message
 * @param  {[Mongoose:User]} users Users that should receive job offer
 * @param  {Mongoose:Job} job Job that freelancers are offered
 */
function sendUsersJobOffer(bot, users, job) {
  if (job.state === strings.jobStates.searchingForFreelancer) {
    users.forEach(user => {
      let keyboard = [];
      Object.keys(strings.freelancerOptions).forEach(key => {
        const option = strings.freelancerOptions[key];
        const inline = option === strings.freelancerOptions.report ?
          strings.reportJobInline : strings.freelancerJobInline;
        keyboard.push([{
          text: option,
          callback_data:
            inline +
            strings.inlineSeparator +
            job._id +
            strings.inlineSeparator +
            option +
            strings.inlineSeparator +
            user.username
        }]);
      });
      const clientRating = job.client.reviews.length > 0 ? `${job.client.GetRateStars()} (${job.client.reviews.length})\n` : '';
      keyboards.sendInline(bot, user.id, `${clientRating}[${job.category.title}]\n${job.description}`, keyboard);
    });
  }
}

/**
 * Called when client clicks button 'select contractors', edits existing job message with new inlines for selecting a contractor out of interested freelancers
 * @param  {Telegram:Message} msg Message to be editted
 * @param  {Mongoose:Job} job Job which message should be editted
 * @param  {Telegram:Bot} bot Bot that should edit message
 */
function showSelectFreelancers(msg, job, bot) {
  keyboards.editMessage(
    bot,
    msg.message.chat.id,
    msg.message.message_id,
    `[${job.category.title}]\n` +
      job.description + '\n\n' +
      strings.selectCandidateMessage + '\n\n' + 
      messageFromFreelancers(job.interestedCandidates),
    jobSelectCandidateKeyboard(job));
}

/**
 * Used to send user all his jobs that aren't yet closed; deletes previous existing job cards
 * @param  {Mongoose:User} user User whos jobs should be sent
 * @param  {Telegram:Bot} bot Bot that should send cards
 */
function sendJobMessages(user, bot) {
  let tCount = 0;
  user.jobs.forEach(job => {
    if (!job.reviewByClient && job.state !== strings.jobStates.removed) {
      tCount++;
      sendNewJobMessage(job, user, bot);
    }
  });
  if (tCount === 0) {
    keyboards.sendInline(bot, user.id, strings.noJobsExistMessage, [])
      .catch(err => console.error(err.message));
  }
}

/**
 * Used to send a new job message replacing the previous one
 * @param  {Mongoose:Job} job  Job that should have new message sent
 * @param  {Mongoose:User} user Owner of this job
 * @param  {Telegram:Bot} bot  Bot that should operate
 */
function sendNewJobMessage(job, user, bot) {
  deprecateJobMessage(job, bot);
  keyboards.sendInline(bot, 
    user.id, 
    strings.loadingMessage, 
    [],
    data => {
      job.current_inline_chat_id = data.chat.id;
      job.current_inline_message_id = data.message_id;
      job.save()
        .then(job => {
          updateJobMessage(job, bot);
        });
    });
}

/**
 * Sends message asking for job hourly rate of job that is being created, saves relevant flag to db for user
 * @param  {Telegram:Message} msg Message received
 * @param  {Mongoose:User} user Owner of job
 * @param  {Telegram:Bot} bot Bot that should respond
 * @param  {Mongoose:Job} job Job that should be altered
 * @param  {Mongoose:Category} category Job's current category
 */
function askForNewJobPriceRange(msg, user, bot, job, category) {
  user.input_state = strings.inputHourlyRateState;
  user.save()
  .then(user => {
    var keyboard = [];
    let options = strings.hourlyRateOptions;
    for (var i in options) {
      let option = options[i];

      var count = 0;
      for (var j in category.freelancers) {
        let freelancer = category.freelancers[j];
        if (freelancer.hourly_rate === option && String(freelancer._id) !== String(user._id)) {
          count += 1;
        }
      }

      if (count > 0) {
        keyboard.push([{
          text: option + ' [' + count + ']'
        }])
      }
    }
    keyboard.unshift([{text:strings.jobCreateCancel}]);
    keyboards.sendKeyboard(
        bot,
        msg.chat.id,
        strings.selectJobHourlyRateMessage,
        keyboard,
        null,
        true);
  });
}

/**
 * Sends message asking for job description of job that is being created, saves relevant flag to db for user
 * @param  {Telegram:Message} msg Message received
 * @param  {Telegram:Bot} bot Bot that should respond
 * * @param  {Mongoose:User} user Owner of job
 */
function askForNewJobDescription(msg, bot, user) {
  user.input_state = strings.inputJobDescriptionState;
  user.save()
  .then(user => {
    bot.sendMessage(msg.chat.id, strings.addJobDescriptionMessage, {
      reply_markup: JSON.stringify({
        keyboard: [[ strings.cancel ]],
        resize_keyboard: true
      }),
      disable_web_page_preview: 'true'
    })
    .catch(function(err)
    {
      console.error(err.message);
    });
  });
}

/**
 * Sends message asking for job category of job that is being created, saves relevant flag to db for user
 * @param  {Telegram:Message} msg Message received
 * @param  {Telegram:Bot} bot Bot that should respond
 */
function askForNewJobCategory(msg, bot) {
  dbmanager.findUser({ id: msg.chat.id })
  .then(user => {
    user.input_state = strings.inputCategoryNameState;
    user.save()
    .then(user => {
      dbmanager.getCategories()
      .then(categories => {
        let categoryButtons = categories
        .filter(category => category.freelancers.length - (category.freelancers.find(f => f.id === user.id) ? 1 : 0) > 0)
        .map(category => {
          return [{
            text: category.title + ' [' + (category.freelancers.length - (category.freelancers.find(f => f.id === user.id) ? 1 : 0)) + ']'
          }];
        });
        categoryButtons.unshift([{text:strings.jobCreateCancel}]);
        keyboards.sendKeyboard(
            bot,
            msg.chat.id,
            strings.selectCategoryMessage,
            categoryButtons);
      });
    });
  });
}

// Management freelancers

/**
 * Used to add freelancers to this job candidates and sending them job offers
 * @param {Mongo:ObjectId} jobId Id of the job where to add candidates
 * @param {[Mongo:User]]} users Array of users to be added as candidates
 * @param {Telegram:Message} msg   Message that came along with inline action
 * @param {Telegram:Bot} bot   Bot that should response
 */
function addFreelancersToCandidates(jobId, users, msg, bot) {
  dbmanager.findJobById(jobId, 'client')
    .then(job => {
      users = users.filter(user => {
        return !job.candidates.map(o => String(o)).includes(String(user._id)) && 
          !job.interestedCandidates.map(o => String(o)).includes(String(user._id)) &&
          !job.notInterestedCandidates.map(o => String(o)).includes(String(user._id));
      });
      users.forEach(user => job.candidates.push(user));
      job.save()
        .then(newJob => {
          sendUsersJobOffer(bot, users, newJob);
          updateJobMessage(newJob, bot);
        });
    });
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
                updateFreelancerMessage(bot, msg, user, job);
            });
        });
    });
}

/**
 * In case if freelancer has been selected by mistake or if freelancer doesn't respond, this function is called to select a different freelancer
 * @param  {Telegram:Bot} bot Bot that should respond
 * @param  {Mongo:ObjectId} jobId Id of relevant job
 */
function selectAnotherFreelancerForJob(bot, jobId) {
  dbmanager.findJobById(jobId, 'freelancer_chat_inlines category')
    .then(job => {
      dbmanager.findUserById(job.selectedCandidate)
        .then(user => {
          const chatInline = dbmanager.chatInline(job, user);
          job.selectedCandidate = null;
          job.state = strings.jobStates.searchingForFreelancer;
          // job.interestedCandidates.push(user);
          job.save()
            .then(newJob => {
              updateJobMessage(newJob, bot);
              updateFreelancerMessage(bot, null, user, job, chatInline);
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
  } else if (job.state === strings.jobStates.rated) {
    updateJobMessageForRated(job, bot);
  } else if (job.state === strings.jobStates.removed) {
    updateJobMessageForRemoved(job, bot);
  }
}

/**
 * Used to deprecate job message
 * @param  {Mongoose:Job} job Job which message should be deprecated
 * @param  {Telegram:Bot} bot Bot that should respond
 */
function deprecateJobMessage(job, bot) {
  keyboards.editMessage(
    bot,
    job.current_inline_chat_id,
    job.current_inline_message_id,
    strings.deprecatedMessage,
    []);
}

/**
 * Updates job message with a list of available Freelancers
 * @param  {Mongoose:Job} job Job which message should be updated
 * @param  {Telegram:Bot} bot Bot that should update message
 */
function updateJobMessageForSearch(job, bot) {
  dbmanager.freelancersForJob(job)
    .then(users => {
      keyboards.editMessage(
        bot,
        job.current_inline_chat_id,
        job.current_inline_message_id,
        `[${job.category.title}]\n${job.description}\n\n${messageFromFreelancers(users)}`,
        jobInlineKeyboard(users, job));
    });
}

/**
 * Updates job message when freelancer was already selected
 * @param  {Mongoose:Job} job Job which message should be updated
 * @param  {Telegram:Bot} bot Bot that should update message
 */
function updateJobMessageForSelected(job, bot) {
  job.populate('selectedCandidate', (err, job) => {
    const user = job.selectedCandidate;
    const ratingMessage = user.reviews.length === 0 ? '' : ` ${user.GetRateStars()} (${user.reviews.length})`;
    const specialSymbol = user.specialSymbol ? user.specialSymbol + ' ' : '';
    const userMessage = `${specialSymbol}@${user.username}${ratingMessage}\n${user.bio}`;

    const keyboard = [[{
        text: strings.jobSelectAnotherFreelancer,
        callback_data:
          strings.selectAnotherFreelancerInline +
          strings.inlineSeparator +
          job._id
      }]];

    keyboards.editMessage(
      bot,
      job.current_inline_chat_id,
      job.current_inline_message_id,
      `[${job.category.title}]\n` +
        job.description + '\n\n' +
        strings.waitContractorResponseMessage + '\n\n' +
        userMessage,
      keyboard);
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
          callback_data: 
            strings.askRateFreelancerInline + 
            strings.inlineSeparator + 
            job._id +
            strings.inlineSeparator +
            user._id
        }
      ]];
      
      //detect if freelancer already was reported by this client
      let isAlreadyReportedInThisJob = !!user.reports.find(report => {
        return String(report.job) == String(job._id);
      });
      
      // !String(user.reportedBy).includes(String(job.client))
      if (!isAlreadyReportedInThisJob) {
        keyboard[0].push({
          text: strings.jobFinishedOptions.report,
          callback_data: 
            strings.reportFreelancerInline + 
            strings.inlineSeparator + 
            job._id + 
            strings.inlineSeparator + 
            user._id
        });
      }

      const ratingMessage = user.reviews.length === 0 ? '' : ` ${user.GetRateStars()} (${user.reviews.length})`
      const specialSymbol = user.specialSymbol ? user.specialSymbol + ' ' : '';

      keyboards.editMessage(
        bot,
        job.current_inline_chat_id,
        job.current_inline_message_id,
        `[${job.category.title}]\n${job.description}\n\n${strings.contactWithFreelancerMessage}\n\n${specialSymbol}@${user.username}${ratingMessage}\n${user.bio}`,
        keyboard);
    });
}

function updateJobMessageForRated(job, bot) {
  keyboards.editMessage(
    bot,
    job.current_inline_chat_id,
    job.current_inline_message_id,
    `${job.description}\n\n${strings.thanksReviewMessage}`,
    []);
}

function updateJobMessageForRemoved(job, bot) {
  keyboards.editMessage(
    bot,
    job.current_inline_chat_id,
    job.current_inline_message_id,
    `${job.description}\n\n${strings.thisWorkIsRemoved}`,
    []);
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
  }],
  [{
    text: strings.jobRefresh,
    callback_data:
      strings.jobManageInline +
      strings.inlineSeparator +
      strings.jobRefresh +
      strings.inlineSeparator +
      job._id
  },
  {
    text: strings.jobDelete,
    callback_data:
      strings.jobManageInline +
      strings.inlineSeparator +
      strings.jobDelete +
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
      text: `${ postfix } ${ freelancer.username }`,
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

// Helpers

/**
 * Constructs a string from freelancers in format: userhandle, bio \n userhandle2, bio2 ...
 * @param  {[Mongoose:User]]} users A list of freelancers for which this message should be created
 * @return {String}       Message constructed from given users
 */
function messageFromFreelancers(users) {
  let message = '';
  for (let i in users) {
    const user = users[i];
    const lineBreak = i == 0 ? '' : '\n';
    if (user.username) {
      const ratingMessage = user.reviews.length === 0 ? '' : ` ${user.GetRateStars()} (${user.reviews.length})`
      const specialSymbol = user.specialSymbol ? user.specialSymbol + ' ' : '';
      message = `${message}${lineBreak}${specialSymbol}@${user.username}${ratingMessage}\n${user.bio}`;
    }
  }
  if (message.length <= 0) {
    message = strings.noCandidatesMessage;
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
  if (job.state === strings.jobStates.removed) {
    updateFreelancerMessage(bot, msg, user, job);
  } else if (job.state !== strings.jobStates.searchingForFreelancer && interested) {
    keyboards.editMessage(
      bot,
      msg.from.id,
      msg.message.message_id,
      strings.clientHasChosenAnotherFreelancer,
      []);
  } else {
    // Remove user from candidates
    let candIndex = job.candidates.indexOf(user._id);
    let intIndex = job.interestedCandidates.indexOf(user._id);
    let notIntIndex = job.notInterestedCandidates.indexOf(user._id);
    if (candIndex > -1) {
      job.candidates.splice(candIndex, 1);
    }
    if (intIndex > -1) {
      job.interestedCandidates.splice(intIndex, 1);
    }
    if (notIntIndex > -1) {
      job.notInterestedCandidates.splice(notIntIndex, 1);
    }
    // Add user to interested or not interested
    if (interested) {
      job.interestedCandidates.push(user._id);
    } else {
      job.notInterestedCandidates.push(user._id);
    }
    job.save()
      .then(newJob => {
        updateJobMessage(newJob, bot);
        updateFreelancerMessage(bot, msg, user, newJob);
      });
  }
}

// Update message

/**
 * Used to update job messahe from freelancer side; uses updateFreelancerMessageForSearch, updateFreelancerMessageForSelected and updateFreelancerMessageForFinished respectively
 * @param  {Telegram:Bot} bot  Bot that should edit message
 * @param  {Telegram:Message} msg  (Optional) Message that came along with action, can use chatInline instead
 * @param  {Mongoose:User} user Freelancer whos message should be editted
 * @param  {Mongoose:Job} job  Relevant job
 * @param {Mongoose:UserChatInline} chatInline (Optional) Chat inline to use instead of msg
 */
function updateFreelancerMessage(bot, msg, user, job, chatInline) {
  if (job.state === strings.jobStates.searchingForFreelancer) {
    updateFreelancerMessageForSearch(bot, msg, user, job, chatInline);
  } else if (job.state === strings.jobStates.freelancerChosen) {
    updateFreelancerMessageForSelected(bot, msg, user, job);
  } else if (job.state === strings.jobStates.finished) {
    updateFreelancerMessageForFinished(bot, msg, user, job);
  } else if (job.state === strings.jobStates.rated) {
    updateFreelancerMessageForRated(bot, msg, user, job);
  } else if (job.state === strings.jobStates.removed) {
    updateFreelancerMessageRemoved(bot, msg, user, job);
  }
}

/**
 * Updates freelancer's job message with buttons 'interested' and 'not interested'
 * @param  {Telegram:Bot} bot  Bot that should edit message
 * @param  {Telegram:Message} msg  Message that came along with action
 * @param  {Mongoose:User} user Freelancer whos message should be editted
 * @param  {Mongoose:Job} job  Relevant job
 */
function updateFreelancerMessageForSearch(bot, msg, user, job, chatInline) {
  let prefix = '';
  // todo: get rid of unefficient check towards the line below
  // job.interestedCandidates.find(userId => { userId == user._id })
  if (job.interestedCandidates.map(o => String(o)).includes(String(user._id))) {
    prefix = `${ strings.interestedOption } ${ strings.freelancerOptions.interested }\n\n`;
  } else if (job.notInterestedCandidates.map(o => String(o)).includes(String(user._id))) {
    prefix = `${ strings.notInterestedOption } ${ strings.freelancerOptions.notInterested }\n\n`;
  }

  let chatId = (!!msg) ? msg.message.chat.id : chatInline.chat_id;
  let messageId = (!!msg) ? msg.message.message_id : chatInline.message_id;

  keyboards.editMessage(
    bot,
    chatId,
    messageId,
    `${prefix}[${job.category.title}]\n${job.description}`,
    []);
}

/**
 * Updates freeelancer's job message when job's state is 'freelancer selected'
 * @param  {Telegram:Bot} bot  Bot that should edit message
 * @param  {Telegram:Message} msg  Message that came along with action
 * @param  {Mongoose:User} user Freelancer whos message should be editted
 * @param  {Mongoose:Job} job  Relevant job
 */
function updateFreelancerMessageForSelected(bot, msg, user, job) {
  job.populate('freelancer_chat_inlines', (err, job) => {
    job.populate('client', (err, job) => {
      let chatInline = dbmanager.chatInline(job, user);

      let keyboard = [];
      Object.keys(strings.freelancerAcceptOptions).forEach(key => {
        const option = strings.freelancerAcceptOptions[key];
        keyboard.push([{
          text: option,
          callback_data:
          strings.freelancerAcceptInline +
          strings.inlineSeparator +
          job._id +
          strings.inlineSeparator +
          option +
          strings.inlineSeparator +
          user.username
        }]);
      });

      keyboards.editMessage(
        bot,
        chatInline.chat_id,
        chatInline.message_id,
        `${ strings.interestedOption } ${ strings.freelancerOptions.interested }\n\n@${job.client.username}\n[${job.category.title}]\n${ job.description }\n\n${ strings.acceptOrRejectMessage }`,
        keyboard);
    });
  });
}

/**
 * Updates freeelancer's job message when job's state is 'job finished'
 * @param  {Telegram:Bot} bot  Bot that should edit message
 * @param  {Telegram:Message} msg  Message that came along with action
 * @param  {Mongoose:User} user Freelancer whos message should be editted
 * @param  {Mongoose:Job} job  Relevant job
 */
function updateFreelancerMessageForFinished(bot, msg, user, job) {
  let keyboard = [[{
    text: strings.jobFinishedOptions.rate,
    callback_data:
      strings.askRateClientInline +
      strings.inlineSeparator +
      job._id +
      strings.inlineSeparator +
      user._id
    }
  ]];

  if (!String(job.reportedBy).includes(String(user._id))) {
    keyboard[0].push({
      text: strings.jobFinishedOptions.report,
      callback_data:
        strings.reportClientInline +
        strings.inlineSeparator +
        job._id +
        strings.inlineSeparator +
        user._id
    });
  }
  
  job.populate('client', (err, job) => {
    keyboards.editMessage(
      bot,
      msg.message.chat.id,
      msg.message.message_id,
      `${strings.contactWithClientMessage}\n\n@${job.client.username}\n[${job.category.title}]\n${job.description}`,
      keyboard);
  });
}

function updateFreelancerMessageForRated(bot, msg, user, job) {
  keyboards.editMessage(
    bot,
    msg.message.chat.id,
    msg.message.message_id,
    `${job.description}\n\n${strings.thanksReviewMessage}`,
    []);
}

function updateFreelancerMessageRemoved(bot, msg, user, job) {
  keyboards.editMessage(
    bot,
    msg.message.chat.id,
    msg.message.message_id,
    `${job.description}\n\n${strings.thisWorkIsRemoved}`,
    []);
}

/**
//// End Freelancers side
*/

// Exports
module.exports = {
  sendJobCreatedMessage,
  sendAllJobs,
  askForNewJobCategory: askForNewJobCategory
};
