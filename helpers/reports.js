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

const admins = ['74169393', '-1001052392095'];

/** Inlines */

/** Reports */
/**
 * Handles case when freelancer is reported
 *
 * @param {Telegram:Bot} bot - Bot that should respond
 * @param {Telegram:Messager} msg - Message received
 */
global.eventEmitter.on(strings().reportFreelancerInline, ({ msg, bot }) => {
  const jobId = msg.data.split(strings().inlineSeparator)[1];
  const freelancerId = msg.data.split(strings().inlineSeparator)[2];

  dbmanager.findJobById(jobId)
    .then(job =>
      dbmanager.findUserById(freelancerId)
        .then(user =>
          reportFreelancer(bot, msg, job, user)
            .then(() => {
              global.eventEmitter.emit(
                strings().shouldUpdateJobMessage,
                { job, bot }
              );
            })
        )
    )
    .catch(/** todo: handle error */);
});

/**
 * Handles case when client is reported
 *
 * @param {Telegram:Bot} bot - Bot that should respond
 * @param {Telegram:Messager} msg - Message received
 */
global.eventEmitter.on(strings().reportClientInline, ({ msg, bot }) => {
  const jobId = msg.data.split(strings().inlineSeparator)[1];
  const freelancerIdReported = msg.data.split(strings().inlineSeparator)[2];

  dbmanager.findJobById(jobId)
    .then(job =>
      dbmanager.findUserById(freelancerIdReported)
        .then(user =>
          // We don't really have difference between reporting job
          // or reporting client, who had created the job.
          // so we can handle both situations with one function
          // the 'user' param here: the reported user(client this time)
          reportJob(bot, msg, job, user)
            .then(reportedJob =>
              dbmanager.findUser({ id: msg.from.id })
                .then((freelancer) => {
                  global.eventEmitter.emit(
                    strings().shouldUpdateFreelancerMessage,
                    { bot, msg, freelancer, reportedJob }
                  );
                })
            )
        )
    )
    .catch(/** todo: handle error */);
});

/**
 * Handles case when job is reported
 *
 * @param {Telegram:Bot} bot - Bot that should respond
 * @param {Telegram:Messager} msg - Message received
 */
global.eventEmitter.on(strings().reportJobInline, ({ msg, bot }) => {
  const jobId = msg.data.split(strings().inlineSeparator)[1];
  const freelancerUsernameReported = msg.data.split(strings().inlineSeparator)[3];

  dbmanager.findJobById(jobId)
    .then(job =>
      dbmanager.findUser({ username: freelancerUsernameReported })
        .then((user) => {
          reportJob(bot, msg, job, user);
        })
    )
    .catch(/** todo: handle error */);
});

/** The rest of the file */

global.eventEmitter.on(strings().adminBanInline, ({ msg, bot }) => {
  const data = msg.data.split(strings().inlineSeparator);

  if (!(data.length === 3)) {
    /** todo: handle error 'Data from tg was corrupted. report.js' */
    return;
  }

  const reportId = data[2];

  dbmanager.findReportById(reportId)
    .then((dbreport) => {
      /** mark report as already viewed by admin */
      const dbreportCopy = Object.create(dbreport);
      dbreportCopy.resolved = true;
      dbreportCopy.save();
      /** find the user and set it's state as banned */
      dbmanager.findUserById(dbreportCopy.sendTo)
        .then((user) => {
          const userCopy = Object.create(user);
          userCopy.ban_state = true;
          userCopy.save();
        })
        .catch(/** todo: handle error */);

      /** remove [BAN] button from all inline messages */
      deleteAllAdminMessages(dbreportCopy, bot);
    })
    .catch(/** todo: handle error */);
});

/**
 * Used to delete all admin messages about given report
 * @param {Mongoose:Report} report - Report which messages should be deleted
 * @param {Telegram:Bot} bot - Bot that should respond
 */
function deleteAllAdminMessages(report, bot) {
  const inlineMessages = report.inlineMessages;

  inlineMessages.forEach((messageData) => {
    const msgData = messageData.split('+');
    if (!(msgData.length === 2)) {
      /** todo: handle error: 'Fatal with report object from database. No + sign in its messages' */
      return;
    }

    const chatId = msgData[1];
    const messageId = msgData[0];
    const emptyKeyboard = [];

    formReportMessage(report)
      .then((message) => {

        /** Mark report message as viewed and resolved */
        bot.editMessageText(message + '\nResolved report.', {
          chat_id: chatId,
          message_id: messageId,
        }).catch(/** todo: handle error */);

      })
      .catch(/** todo: handle error */);

    keyboards.editInline(
      bot,
      chatId,
      messageId,
      emptyKeyboard
    );
  });
}

/**
 * Get admin keyboard for banning
 * @param {String} adminChatId - Admin chat id
 * @param {String} reportId - Id of report to present keyboard
 * @return {Telegram:InlineKeyboard} Keyboard to be presented
 */
function adminBanKeyboard(adminChatId, reportId) {
  const keyboard = [[
    {
      text: 'Ban',
      callback_data:
      [
        strings().adminBanInline,
        adminChatId,
        reportId,
      ].join(strings().inlineSeparator),
    },
  ]];

  return keyboard;
}

/**
 * Sends message about new Report to all admin chats.
 * @param bot - which responds
 * @param report - mongoose object ! Not and ObjectId !
 */
function sendReportAlert(bot, report) {
  formReportMessage(report)
    .then((message) => {
      // todo: fix adminId, for some reason it was undefined before
      const adminId = admins[1];
      const keyboard = adminBanKeyboard(adminId, report._id);
      const replyMarkup = JSON.stringify({
        inline_keyboard: keyboard,
      });

      admins.forEach((admin) => {
        bot.sendMessage(admin, message, {
          reply_markup: replyMarkup,
        })
          .then((sentMessage) => {
            report.inlineMessages.push(`${sentMessage.message_id}+${sentMessage.chat.id}`);
            report.save();
          })
          .catch(/** todo: handle error */);
      });
    })
    .catch(/** todo: handle error */);
}

/**
 * Getting a display message of the report
 * @param {Mongoose:Report} report - Report which message should be returned
 */
function formReportMessage(report) {
  /**
   * Returns user information display text
   * @param {Mongoose:Job} job - Relevant job
   * @param {Mongoose:user} user - User which info should be returned
   * @return {String} User information display text
   */
  function formUserInformation(job, user) {
    const result = ((String(job.client) === String(user._id)) ?
      'client' :
      'freelancer'
    );

    return `@${user.username} (${result})`;
  }

  return new Promise(fulfill =>
    dbmanager.findUserById(report.sendBy)
      .then(sender =>
        dbmanager.findUserById(report.sendTo)
          .then(receiver =>
            dbmanager.findJobById(report.job)
              .then((job) => {
                const messageText =
                  `${formUserInformation(job, sender)} reported ${formUserInformation(job, receiver)}\n${job._id}\n${job.description}`;

                fulfill(messageText);
              })
          )
      )
  );
}

/**
 * Function to trigger sending response to user
 * @param {Telegam:Bot} bot - Bot that should send response
 * @param {Telegram:Message} msg - Message that triggered this function
 */
function sendResponseToUser(bot, msg) {
  bot.sendMessage(msg.from.id, strings().reportThankYouMessage, {
    disable_web_page_preview: 'true',
  });
}

/**
 * Initializes job report
 * @param {Telegram:Bot} bot - Bot that should respond
 * @param {Telegram:Message} msg - Message passed with action
 * @param {Mongoose:ObjectId} job - Job object which is reported
 * @param {Mongoose:ObjectId} user - User object who sends us a report
 */
function reportJob(bot, msg, job, user) {
  return new Promise((fullfill) => {
    const clientId = job.client;
    const report = new Report({
      sendBy: user._id,
      sendTo: clientId,
      job: job._id,
    });

    report.save()
      .then((savedReport) => {
        job.reports.push(savedReport._id);
        job.reportedBy.push(user._id);
        job.save()
          .then(fullfill)
          .catch(/** todo: handle error */);

        dbmanager.findUserById(clientId)
          .then((client) => {
            client.reports.push(savedReport._id);
            client.reportedBy.push(user._id);
            client.save();
          })
          .catch(/** todo: handle error */);

        global.eventEmitter.emit(
          strings().shouldMakeInterested,
          {
            interested: false,
            bot,
            msg,
            job,
            user,
          }
        );

        sendReportAlert(bot, savedReport);
        sendResponseToUser(bot, msg);
      })
      .catch(/** todo: handle error */);
  });
}

/** function reportUser(from, to, job) {
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
}*/

/**
 * Reporting a freelancer
 * @param {Telegram:Bot} bot - Bot that should respond
 * @param {Telegram:Message} msg - Message that triggered this function
 * @param {Mongoose:Job} job - Relevant job
 * @param {Mongoose:User} user - Freelancer to report
 */
function reportFreelancer(bot, msg, job, user) {
  return new Promise((fullfill) => {
    const clientId = job.client;
    const report = new Report({
      sendBy: clientId,
      sendTo: user._id,
      job: job._id,
    });

    report.save()
      .then((savedReport) => {
        user.reports.push(savedReport._id);
        user.reportedBy.push(clientId);
        user.save()
          .then(() => {
            sendReportAlert(bot, savedReport);
            sendResponseToUser(bot, msg);
            fullfill();
          })
          .catch(/** todo: handle error */);
      })
      .catch(/** todo: handle error */);
  });
}
