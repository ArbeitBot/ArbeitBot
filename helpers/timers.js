/**
 * Used to send users reminders over time
 *
 * @module helpers/timers
 * @license MIT
 */

/** Dependencies */
const dbmanager = require('./dbmanager');
const keyboards = require('./keyboards');
const strings = require('./strings');
const adminReports = require('./adminReports');
const bot = require('./telegramBot');

/** General functions */

/**
 * Starts logic based on timers
 * @param {Telegram:Bot} bot Bot that should later send notifications to users
 */
function startTimers(bot) {
  startJobCreationReminderTimer(bot)
}

/** Job creation reminder */

/**
 * Starts timer that fires checkJobCreationReminder()
 * @param {Telegram:Bot} bot Bot that should later send notifications to users
 */
function startJobCreationReminderTimer(bot) {
  const hour = 1000 * 60 * 60;
  checkJobsCreationReminder(bot);
  setInterval(() => {
    checkJobsCreationReminder(bot);
  }, hour);
}

/**
 * Finds all jobs that need to get a reminder to user and checks all of those jobs
 * @param {Telegram:Bot} bot Bot that should later send notifications to users
 */
function checkJobsCreationReminder(bot) {
  dbmanager.getJobsForReminder()
    .then((jobs) => {
      jobs.forEach((job) => {
        checkJobCreationReminder(job, bot);
      });
    })
    .catch(/** todo: handle error */);
}

/**
 * Checks if job needs to be reminded to user and if so calls relevant function
 * @param {Mongoose:Job} job Job to check
 * @param {Telegram:Bot} bot Bot that should respond
 */
function checkJobCreationReminder(job, bot) {
  const day = 1000 * 60 * 60 * 24;
  const now = new Date();
  if (now.getTime() - job.updatedAt.getTime() > day) {
    sendJobCreationReminder(job, bot);
  }
}

/**
 * Sends job creation reminder asking if user needs any help with hiring freelancers
 * @param {Mongoose:Job} job Relevant job
 * @param {Telegram:Bot} bot Bot that should send notification
 */
function sendJobCreationReminder(job, bot) {
  job.populate('client', (err, populatedJob) => {
    /** todo: handle error */
    const jobCopy = Object.create(populatedJob);
    jobCopy.remindersFired.push('findFreelancersReminder');
    jobCopy.save()
      .then((savedJob) => {
        let addition = '';
        if (savedJob.description.length > 150) {
          addition = '...';
        }
        const text = `${strings().jobCreationFindFreelancerReminderMessage1}\n\n\`${savedJob.description.substring(0, 150)}${addition}\`\n\n${strings().jobCreationFindFreelancerReminderMessage2}`;
        keyboards.sendInline(bot, savedJob.client.id, text, keyboards.arbeitbotSupportKeyboard, null, true);
        adminReports.sentJobReminder(bot , job);
      })
      .catch(/** todo: handle error */);
  });
}

/** Exports */
module.exports = {
  startTimers,
};