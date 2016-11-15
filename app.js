/**
 * Arbeit Telegram Bot executable file;
 * Setup mongoose and starts logic.js.
 *
 * @module app
 * @license MIT
 */

/** Dependencies */
const mongoose = require('mongoose');
const events = require('events');

// noinspection JSAnnotator
global.eventEmitter = new events.EventEmitter();

/** Configure a bot */
const config = require('./config');

/** Setup mongoose */
mongoose.Promise = global.Promise;
mongoose.connect(config.database);

/** Start bot */
require('./helpers/logic');

/** Start stat server */
require('./helpers/statServer');

/** Start timers for retention boost and reminders */
require('./helpers/timers').startTimers();

/** Print a message to assure that bot is up and running */
console.log('Bot is up and running'); // eslint-disable-line no-console
