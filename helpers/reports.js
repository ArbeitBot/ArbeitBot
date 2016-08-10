let mongoose = require('mongoose');
let dbmanager = require('./dbmanager');

let Job = mongoose.model('job');
let Report = mongoose.model('report');

let admins = ['74169393'];

function sendReportAlert(bot, report) {
  admins.forEach(admin => {
    bot.sendMessage({
      chat_id: admin,
      text: `${report.sendBy} зарепортил ${report.sendTo} по работe ${report.job}`
    })
  })
}

function sendResponseToUser(bot, msg) {
  bot.sendMessage({
    chat_id: msg.from.id,
    text: 'Thanks you for reporting'
  })
}

/**
 * Initializes job report
 * @param  {Telegram:Bot} bot  Bot that should respond
 * @param  {Telegram:Message} msg  Message passed with action
 * @param  {Mongoose:ObjectId} job  Job object to report
 * @param  {Mongoose:ObjectId} user User object who reports
 */
function reportJob(bot, msg, job, user) {
  // Найти id клиента и фрилансера
  // Создать новый обьект report
  // Сохранить его и добавить его id к работе, которую зарепортили, и к создателю работы
  // Отправить сообщения с инфой о репорте всем админам
  // Отправить сообщение пользователю
  
  let clientId = job.client;
  console.log(clientId);
  let report = new Report({
      sendBy: user._id,
      sendTo: clientId,
      job: job._id
    });

  report.save(err => {
    if (err) { console.log(err) }
    else {
      job.reports.push(report._id);
      job.reportedBy.push(user._id);
      job.save();
      dbmanager.findUserById(clientId)
        .then(client => {
          client.reports.push(report._id);
          client.reportedBy.push(user._id);
          client.save();
        });

      sendReportAlert(bot, report);
      sendResponseToUser(bot, msg);
    }
  });
}

module.exports = {
  reportJob: reportJob
};