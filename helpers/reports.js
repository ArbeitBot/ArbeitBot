/**
 * @module helpers/reports
 * @license MIT
 */

/** Dependencies */
const keyboards = require('./keyboards');
const dbmanager = require('./dbmanager');
const mongoose = require('mongoose');

const strings = require('./strings');
const Report = mongoose.model('report');
const Job = mongoose.model('job');

const admins = ['74169393', '-1001052392095'];

/** Inlines */

/** Reports */
/**
 * Handles case when freelancer is reported
 *
 * @param {Telegram:Bot} bot - Bot that should respond
 * @param {Telegram:Messager} msg - Message received
 */
eventEmitter.on(strings.reportFreelancerInline, ({ msg, bot }) => {
  const jobId = msg.data.split(strings.inlineSeparator)[1];
  const freelancerId = msg.data.split(strings.inlineSeparator)[2];

  dbmanager.findJobById(jobId)
    .then((job) => {
      dbmanager.findUserById(freelancerId)
        .then((user) => {
          reportFreelancer(bot, msg, job, user)
            .then(() => {
              eventEmitter.emit(
                strings.shouldUpdateJobMessage,
                { job, bot }
              );
            });
        })
    });
});

/**
 * Handles case when client is reported
 *
 * @param {Telegram:Bot} bot - Bot that should respond
 * @param {Telegram:Messager} msg - Message received
 */
eventEmitter.on(strings.reportClientInline, ({ msg, bot }) => {
  const jobId = msg.data.split(strings.inlineSeparator)[1];
  const freelancerIdReported = msg.data.split(strings.inlineSeparator)[2];

  dbmanager.findJobById(jobId)
    .then((job) => {
      dbmanager.findUserById(freelancerIdReported)
        .then((user) => {
          // We don't really have difference between reporting job
          // or reporting client, who had created the job.
          // so we can handle both situations with one function
          // the 'user' param here: the reported user(client this time)
          reportJob(bot, msg, job, user)
            .then((job) => {
              dbmanager.findUser({id: msg.from.id})
                .then((freelancer) => {
                  eventEmitter.emit(
                    strings.shouldUpdateFreelancerMessage,
                    { bot, msg, freelancer, job }
                  );
                });
            });
        })
    });
});

/**
 * Handles case when job is reported
 *
 * @param {Telegram:Bot} bot - Bot that should respond
 * @param {Telegram:Messager} msg - Message received
 */
eventEmitter.on(strings.reportJobInline, ({ msg, bot }) => {
  const jobId = msg.data.split(strings.inlineSeparator)[1];
  const freelancerUsernameReported = msg.data.split(strings.inlineSeparator)[3];

  dbmanager.findJobById(jobId)
    .then((job) => {
      dbmanager.findUser({ username: freelancerUsernameReported })
        .then((user) => {
          reportJob(bot, msg, job, user);
        });
    });
});

/** The rest of the file */

eventEmitter.on(strings.adminBanInline, ({ msg, bot }) => {
  const data = msg.data.split(strings.inlineSeparator);

  if (!(data.length === 3)) {
    console.log('Data from tg was corrupted. report.js');
    return;
  }

  const reportId = data[2];

  dbmanager.findReportById(reportId)
    .then((report) => {
      //mark report as already viewed by admin
      report.resolved = true;
      report.save();
      //ban the user
      dbmanager.findUserById(report.sendTo)
        .then((user) => {
          user.ban_state = true;
          user.save();
        });

      //delete BAN button from all inline messages
      deleteAllAdminMessages(report, bot);
    })
    .catch((err) => { console.error(err.message); });
});

function deleteAllAdminMessages(report, bot) {
  const inlineMessages = report.inlineMessages;

  inlineMessages.forEach((messageData) => {
    let msgData = messageData.split('+');
    if (!(msgData.length === 2)) {
      console.log('Fatal with report object from database. No + sign in its messages');
      console.log('Report id: ' + report._id);
      return;
    }

    bot.editMessageText('Resolved report.', {
      chat_id: msgData[1],
      message_id: msgData[0]
    }).catch((err) => { console.log('lol', err); });

    keyboards.editInline(
      bot,
      msgData[1],
      msgData[0],
      []
    );
  });
}

function adminBanKeyboard(adminChatId, reportId) {
  const keyboard = [[
    {
      text: 'Ban',
      callback_data:
        [
         strings.adminBanInline,
         adminChatId,
         reportId,
        ].join(strings.inlineSeparator),
    }
  ]];

  return keyboard;
}

/**
 *
 * @param bot - which responds
 * @param report - mongoose object ! Not and ObjectId !
 */
function sendReportAlert(bot, report) {
  // Сформировать текст сообщения
  // Затем для каждого админа
  // Сформировать инлайн клавиатуру
  // отправить
  formReportMessage(report)
    .then((message) => {
      admins.forEach((admin) => {
        const keyboard = adminBanKeyboard(admin, report._id);

        bot.sendMessage(admin, message, {
          reply_markup: JSON.stringify({
            inline_keyboard: keyboard,
          }),
        })
          .then((message) => {
            report.inlineMessages.push(message.message_id + '+' + message.chat.id);
          })
          .then(() => {
            report.save();
          })
          .catch((err) => { console.log(err.name); });
      });
    });
}

function formReportMessage(report) {
  function formUserInformation(job, user) {
    const result = ((String(job.client) == String(user._id)) ?
      'client' :
      'freelancer'
    );

    return `@${user.username} (${result})`
  }

  return new Promise((fulfill) => {
    dbmanager.findUserById(report.sendBy)
      .then((sender) => {
        dbmanager.findUserById(report.sendTo)
          .then((receiver) => {
            dbmanager.findJobById(report.job)
              .then((job) => {
                const messageText =
                  `${formUserInformation(job, sender)} reported ${formUserInformation(job, receiver)}\n` +
                  job._id + '\n' +
                  job.description;

                fulfill(messageText);
              });
          });
      });
  });
}

function sendResponseToUser(bot, msg) {
  bot.sendMessage(msg.from.id, strings.reportThankYouMessage, {
    disable_web_page_preview: 'true',
  });
}

/**
 * Initializes job report
 *
 * @param {Telegram:Bot} bot - Bot that should respond
 * @param {Telegram:Message} msg - Message passed with action
 * @param {Mongoose:ObjectId} job - Job object to report
 * @param {Mongoose:ObjectId} user - User object who reports
 */
function reportJob(bot, msg, job, user) {
  // Найти id клиента и фрилансера
  // Создать новый обьект report
  // Сохранить его и добавить его id к работе, которую зарепортили, и к создателю работы
  // Отправить сообщения с инфой о репорте всем админам
  // Отправить сообщение пользователю
  return new Promise((fullfill) => {
    let clientId = job.client;
    let report = new Report({
        sendBy: user._id,
        sendTo: clientId,
        job: job._id,
      });

    report.save()
      .then((report) => {
        job.reports.push(report._id);
        job.reportedBy.push(user._id);
        job.save().then(fullfill);

        dbmanager.findUserById(clientId)
          .then((client) => {
            client.reports.push(report._id);
            client.reportedBy.push(user._id);
            client.save();
          });

        eventEmitter.emit(
          strings.shouldMakeInterested,
          {
            interested: false,
            bot,
            msg,
            job,
            user
          }
        );

        sendReportAlert(bot, report);
        sendResponseToUser(bot, msg);
    });
  });
}

/**
 * THIS IS UNUSED CURRENTLY FUNCTIONS
 * ONE DAY I'LL USE IT
 * TODAY IS NOT THIS DAY.
 * All params are id
 * @param from id
 * @param to id
 * @param job id
 */
function reportUser(from, to, job) {
  return new Promise((fullfill) => {
    let report = new Report({
      sendBy: from,
      sendTo: to,
      job: job,
    });

    report.save()
      .then((report) => {
        dbmanager.findUserById(to)
          .then((user) => {
            user.reports.push(report);
            user.reportedBy.push(from);
            user.save();
            fulfill();
          });
    });
  });
}

function reportFreelancer(bot, msg, job, user) {
  return new Promise((fullfill) => {
    let clientId = job.client;
    let report = new Report({
      sendBy: clientId,
      sendTo: user._id,
      job: job._id,
    });

    report.save()
      .then((report) => {
        user.reports.push(report._id);
        user.reportedBy.push(clientId);
        user.save()
          .then(() => {
            sendReportAlert(bot, report);
            sendResponseToUser(bot, msg);
            fullfill();
          })
          .catch((err) => {
            console.log('Error in reportFreelancer(...) in reports.js file. 289.');
            console.log(err);
          });
    });
  })
}
