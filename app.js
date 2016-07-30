/**
 * Arbeit Telergam Bot
 */
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const config = require('./config');

// setup mongoose and load all models
mongoose.connect(config.database);
fs.readdirSync(path.join(__dirname, '/models')).forEach(function(filename) {
  if (~filename.indexOf('.js')) {
    require(path.join(__dirname, '/models/', filename))
  }
});

// start bot
require('./helpers/logic');
console.log('Bot is up and running!');
