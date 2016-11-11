/**
 * Reports to secret Telegram admins group about new events
 *
 * @module helpers/adminReports
 * @license MIT
 */

const config = require('../config');

const adminChatId = config.adminChatId;

/**
 * Sends admins notification that job was created
 *
 * @param  {Telegram:Bot} bot - Bot that should respond
 * @param  {Mongoose:Job} job - Job that should be sent
 */
function jobCreated(bot, job) {
  job.populate('client', (err, populatedJob) => {
    const msg = `👍 @${populatedJob.client.username} created a job:\n\n[${populatedJob.category.title}] ${populatedJob.hourly_rate}\n${populatedJob.description}`;
    bot.sendMessage(adminChatId, msg);
  });
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

module.exports = {
  jobCreated,
  userRegistered,
};

