/**
 * Arbeit Telergam Bot executable file; loads all mongoose models and starts logic.js
 */

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const config = require('./config');

// setup mongoose and load all models
mongoose.connect(config.database);
fs.readdirSync(path.join(__dirname, '/models')).forEach(filename => {
  if (~filename.indexOf('.js')) {
    require(path.join(__dirname, '/models/', filename))
  }
});

// start bot
require('./helpers/logic');

// print a message to assure that bot is up and running
console.log('Bot is up and running!');
