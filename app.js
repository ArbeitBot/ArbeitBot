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
fs.readdirSync(path.join(__dirname, '/models')).forEach((filename) => {
  if (filename.indexOf('.js') !== 1) {
    require.call(global, path.join(__dirname, '/models/', filename));
  }
});

/** Start bot */
require('./helpers/logic');

/** Start stat server */
require('./helpers/statServer');

/** Print a message to assure that bot is up and running */
console.log('Bot is up and running');
