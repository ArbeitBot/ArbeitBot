/**
 * Arbeit Telergam Bot executable file; loads all mongoose models and starts logic.js
 *
 * @module app
 * @license MIT
 */

/** Dependencies */
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const config = require('./config');
const events = require('events');

/** Noinspection JSAnnotator */
global.eventEmitter = new events.EventEmitter();

/** Setup mongoose and load all models */
mongoose.Promise = global.Promise;
mongoose.connect(config.database);
fs.readdirSync(path.join(__dirname, '/models')).forEach(filename => {
  if (~filename.indexOf('.js')) {
    require(path.join(__dirname, '/models/', filename))
  }
});

/** Start bot */
require('./helpers/logic');

/** Start stat server */
require('./helpers/statServer');

/** Print a message to assure that bot is up and running */
console.log('Bot is up and running');
