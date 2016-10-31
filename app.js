/**
 * Arbeit Telergam Bot executable file; loads all mongoose models and starts logic.js
 *
 * @module app
 * @license MIT
 */

/** Dependencies */
const mongoose = require('mongoose');
const events = require('events');
const path = require('path');
const fs = require('fs');

/** Noinspection JSAnnotator */
global.eventEmitter = new events.EventEmitter();

/** Configure a bot */
const config = require('./config');

/** Setup mongoose and load all models */
mongoose.Promise = global.Promise;
mongoose.connect(config.database);

/** Start bot */
require('./helpers/logic');

/** Start stat server */
require('./helpers/statServer');

/** Print a message to assure that bot is up and running */
console.log('Bot is up and running'); // eslint-disable-line no-console
