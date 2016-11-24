/**
 * Reports to secret Telegram admins group about new events
 *
 * @module helpers/adminReports
 * @license MIT
 */

const config = require('../config');

const adminChatId = config.adminChatId || -1001088665045;

/**
 * Sends admins notification that job was created
 *
 * @param  {Telegram:Bot} bot - Bot that should respond
 * @param  {Mongoose:Job} job - Job that should be sent
 */
function jobCreated(bot, job) {
  job.populate('client', (err, populatedJob) => {
    /** todo: handle error */
    const msg = `👍 @${populatedJob.client.username} created the job:\n\n[${populatedJob.category.title}] ${populatedJob.hourly_rate}\n${populatedJob.description}`;
    bot.sendMessage(adminChatId, msg);
  });
}

/**
 * Sends admin notification that job was deleted
 * @param {Telegram:Bot} bot Bot that should send notification
 * @param {Mongoose:Job} job Job that was removed
 */
function jobDeleted(bot, job) {
  job.populate('client', (err, populatedJob) => {
    /** todo: handle error */
    const msg = `❌ @${populatedJob.client.username} deleted the job:\n\n[${populatedJob.category.title}] ${populatedJob.hourly_rate}\n${populatedJob.description}`;
    bot.sendMessage(adminChatId, msg);
  });
}

/**
 * Notifies when a freelancer was selected for a job
 * @param {Telegram:Bot} bot Bot that should send notification
 * @param {Mongoose:Job} job Relevant job
 * @param {Mongoose:User} freelancer Freelancer that gets selected
 */
function selectedFreelancerForJob(bot, job, freelancer) {
  job.populate('client', (err, populatedJob) => {
    /** todo: handle error */
    const msg = `✅ @${populatedJob.client.username} selected @${freelancer.username} for the job:\n\n[${populatedJob.category.title}] ${populatedJob.hourly_rate}\n${populatedJob.description}`;
    bot.sendMessage(adminChatId, msg);
  });
}

/**
 * Notifies when a freelancer accepts or refuses job offer
 * @param {Telegram:Bot} bot Bot that should send notification
 * @param {Mongoose:Job} job Relevant job
 * @param {Mongoose:User} freelancer Freelancer that performs this action
 * @param {Boolean} accept True if accept, false if reject
 */
function acceptOrRejectJobOffer(bot, job, freelancer, accept) {
  job.populate('client', (err, populatedJob) => {
    /** todo: handle error */
    const msg = accept ?
      `✊ @${freelancer.username} accepted the job offer by @${populatedJob.client.username}:\n\n[${populatedJob.category.title}] ${populatedJob.hourly_rate}\n${populatedJob.description}` :
      `👎 @${freelancer.username} rejected the job offer by @${populatedJob.client.username}:\n\n[${populatedJob.category.title}] ${populatedJob.hourly_rate}\n${populatedJob.description}`;
    bot.sendMessage(adminChatId, msg);
  });
}

/**
 * Notifies when bot ends a job reminder
 * @param {Tleegram:Bot} bot Bot that should send notification
 * @param {Mongoose:Job} job Job that is getting reported
 */
function sentJobReminder(bot, job) {
  const msg = `🙆‍♂️ Bot sent reminder to @${job.client.username} for the job:\n\n${job.description}`;
  bot.sendMessage(adminChatId, msg);
}

/**
 * Sends admins notification that user has registered
 *
 * @param  {Telegram:Bot} bot - Bot that should respond
 * @param  {Mongoose:User} user - User that should be sent
 */
function userRegistered(bot, user) {
  bot.sendMessage(adminChatId, `🦄 @${user.username} just registered!`);
}

/**
 * Notifies admins that a user has started freelancer tutorial
 * @param {Telegram:Bot} bot Bot that should notify admins
 * @param {Mongoose:User} user User that started tutorial
 */
function freelancerTutorialStarted(bot, user) {
  bot.sendMessage(adminChatId, `🙆‍ @${user.username} started freelancer tutorial`);
}

/**
 * Notifies admins that a user has ended freelancer tutorial
 * @param {Telegram:Bot} bot Bot that should notify admins
 * @param {Mongoose:User} user User that ended tutorial
 */
function freelancerTutorialEnded(bot, user) {
  bot.sendMessage(adminChatId, `🙅‍ @${user.username} ended freelancer tutorial`);
}

/**
 * Notifies admins that a user has started client tutorial
 * @param {Telegram:Bot} bot Bot that should notify admins
 * @param {Mongoose:User} user User that started tutorial
 */
function clientTutorialStarted(bot, user) {
  bot.sendMessage(adminChatId, `🙆‍ @${user.username} started client tutorial`);
}

/**
 * Notifies admins that a user has ended client tutorial
 * @param {Telegram:Bot} bot Bot that should notify admins
 * @param {Mongoose:User} user User that ended tutorial
 */
function clientTutorialEnded(bot, user) {
  bot.sendMessage(adminChatId, `🙅‍ @${user.username} ended client tutorial`);
}

module.exports = {
  jobCreated,
  jobDeleted,
  selectedFreelancerForJob,
  acceptOrRejectJobOffer,
  userRegistered,
  sentJobReminder,
  freelancerTutorialStarted,
  freelancerTutorialEnded,
  clientTutorialStarted,
  clientTutorialEnded,
};

