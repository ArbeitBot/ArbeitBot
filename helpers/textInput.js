/**
 * Handles all text inputs in bot like inputting freelancer bio or job description
 */

let dbmanager = require('./dbmanager');
let strings = require('./strings');
let keyboards = require('./keyboards');
let jobManager = require('./jobManager'); 

let mongoose = require('mongoose');
let Job = mongoose.model('job');
let Report = mongoose.model('report');

/**
 * Checks if state of user that sent message is one of input ones 
 * @param  {Telegram:Messahe}   msg      Message received
 * @param  {Function} callback Callback(input_state, user) that is called when check is done
 */
function check(msg, callback) {
  dbmanager.findUser({ id: msg.chat.id })
    .then(user => {
      if (user) {
        callback(user.input_state, user);
      } else {
        callback();
      }
    })
}

/**
 * Handler for user inputs, ran after check for input state was positive; depending on user's input state saves right values to db
 * @param  {Telegram:Message} msg  Message that was received
 * @param  {Mongoose:User} user User that sent the Message
 * @param  {Telegram:Bot} bot  Bot that should respond
 */
function handle(msg, user, bot) {
  if (user.input_state == strings.inputBioState) {
    let newBio = msg.text.substring(0, 150);
    
    let needsCongrats = !user.bio && !!user.hourly_rate && user.categories.length > 0;

    user.bio = newBio;
    user.input_state = undefined;
    user.save()
      .then(user => {
        bot.sendMessage({
          chat_id: msg.chat.id,
          text: strings.changedBioMessage+user.bio,
          reply_markup: JSON.stringify({
            keyboard: keyboards.freelancerKeyboard(user),
            resize_keyboard: true 
          }),
          disable_web_page_preview: 'true'
        })
          .then(data => {
            if (needsCongrats) {
              keyboards.sendKeyboard(
                bot,
                user.id, 
                strings.filledEverythingMessage, 
                keyboards.freelancerKeyboard(user));
            }
          })
          .catch(err => console.log(err));
      });
  } else if (user.input_state == strings.inputCategoryNameState) {
    if (msg.text == strings.jobCreateCancel) {
      cancelJobCreation(msg, user, bot);
    } else if (msg.text.indexOf(' [') > -1) {
      let categoryTitle = msg.text.split(' [')[0];
      startJobDraft(categoryTitle, msg, user, bot);
    } else {
      console.log(msg);
    }
    
  } else if (user.input_state == strings.inputHourlyRateState) {
    if (msg.text == strings.jobCreateCancel) {
      cancelJobCreation(msg, user, bot);
    } else if (msg.text.indexOf(' [') > -1) {
      let hourlyRate = msg.text.split(' [')[0];
      addHourlyRateToJobDraft(hourlyRate, msg, user, bot);
    } else {
      console.log(msg);
    }
  } else if (user.input_state == strings.inputJobDescriptionState) {
    let description = msg.text.substring(0, 500);
    addDescriptionToJobDraft(description, msg, user, bot);
  } else if (user.input_state == strings.inputReportMessage) {
    let reportMessage = msg.text.substring(0, 200);
    completeReport(reportMessage, msg, user, bot);
  } else {
    console.log(msg);
  }
}

/**
 * Sends message to user asking for bio and adds relevant flags to user's object
 * @param  {Telegram:Message} msg Message received
 * @param  {Telegram:Bot} bot Bot that should respond
 */
function askForBio(msg, bot) {
  dbmanager.findUser({ id: msg.chat.id })
    .then(user => {
      user.input_state = strings.inputBioState;
      user.save()
        .then(user => {
          let message = user.bio ?
            strings.editBioMessage+'\n\n'+strings.yourCurrentBio+'\n\n'+user.bio :
            strings.editBioMessage;
          bot.sendMessage({
            chat_id: msg.chat.id,
            text: message,
            reply_markup: JSON.stringify({
              hide_keyboard: true
            }),
            disable_web_page_preview: 'true'
          }).catch(err => console.log(err.error.description));
        });
    });
}

/**
 * Sends message asking for job category of job that is being created, saves relevant flag to db for user
 * @todo: Maybe we can move this to job manager?
 * @param  {Telegram:Message} msg Message received
 * @param  {Telegram:Bot} bot Bot that should respond
 */
function askForNewJobCategory(msg, bot) {
  function saveUserCallback(user) {
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
  }
  dbmanager.findUser({ id: msg.chat.id })
    .then(user => {
      user.input_state = strings.inputCategoryNameState;
      user.save()
        .then(user => {
            saveUserCallback(user);
        });
    });
}

/**
 * Sends message asking for job hourly rate of job that is being created, saves relevant flag to db for user
 * @todo: Maybe we can move this to job manager?
 * @param  {Telegram:Message} msg Message received
 * @param  {Mongoose:User} user Owner of job
 * @param  {Telegram:Bot} bot Bot that should respond
 * @param  {Mongoose:Job} job Job that should be altered
 * @param  {Mongoose:Category} category Job's current category
 */
function askForNewJobPriceRange(msg, user, bot, job, category) {
  user.input_state = strings.inputHourlyRateState;
  user.save((err, user) => {
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
        keyboard);
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
  user.save((err, user) => {
    if (err) {
      // todo: handle error
    } else {
      bot.sendMessage({
        chat_id: msg.chat.id,
        text: strings.addJobDescriptionMessage,
        reply_markup: JSON.stringify({
          hide_keyboard: true
        }),
        disable_web_page_preview: 'true'
      })
      .catch(function(err)
      {
        console.log(err);
      });
    }
  });
}

/**
 * Cancels job creation, removes job draft and resets user's input state
 * @param  {Telegram:Message} msg  Message received
 * @param  {Mongoose:User} user Owner of job
 * @param  {Telegram:Bot} bot Bot that should respond
 */
function cancelJobCreation(msg, user, bot) {
  user.input_state = undefined;
  user.job_draft = undefined;
  user.save((err, user) => {
    if (err) {
      // todo: handle error
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
        client: user
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
  jobDraft.save((err, draft) => {
    if (err) {
      // todo: handle error
    } else {
      user.save((err, user) => {
        jobManager.sendJobCreatedMessage(user, bot, draft);
      });
    }
  })
}

//
function completeReport(reportMessage, msg, user, bot) {
  // TODO: Нет обработки ошибок
  // TODO: Поблагодарить пользователя за репорт
  /**
   * Вызывается после того, как мы получили сообщение
   * от пользователя, если он был в состоянии написания репорта
   * @type {undefined|*}
   */
  let reportsLimit = 3;
  // Записываем jobId
  let jobId = user.report_draft;
  
  // Обнуляем состояние драфта, т.к. у нас есть вся необходимая информация:
  // Юзер, который репортит, id работы, которую репортят и сообщение.
  user.report_draft = undefined;
  user.input_state = undefined;
  user.save();
  // Создаем новый обьект Report с полученной информацией
  let report = new Report({
    sendBy: user._id,
    sendTo: jobId,
    message: reportMessage
  });
  report.save();

  dbmanager.findJobById(jobId)
    .then(job => {
      // Обновить обьект job добавив туда новый Report
      job.reports.push(report._id);
      if (job.reports.length >= reportsLimit) {
        job.state = strings.jobStates.frozen;
      }
      job.reportedBy.push(user._id);
      job.save();
      
      //Получаем обьект работодателя
      let clientId = job.client;
      dbmanager.findUserById(clientId)
        .then(client => {
          //Добавляем Report в обьект работодателя
          client.reports.push(report);
          client.reportedBy.push(user._id);
          client.save();
        });
      bot.sendMessage({
        chat_id: msg.from.id,
        text: strings.report.thanks,
        disable_web_page_preview: 'true'
      });
    });
}

// Exports
module.exports = {
  check: check,
  handle: handle,
  askForBio: askForBio,
  askForNewJobCategory: askForNewJobCategory
};