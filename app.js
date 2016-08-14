/**
 * Arbeit Telergam Bot executable file; loads all mongoose models and starts logic.js
 */

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const config = require('./config');
const events = require('events');
global.eventEmitter = new events.EventEmitter();

// setup mongoose and load all models
mongoose.Promise = global.Promise;
mongoose.connect(config.database);
fs.readdirSync(path.join(__dirname, '/models')).forEach(filename => {
  if (~filename.indexOf('.js')) {
    require(path.join(__dirname, '/models/', filename))
  }
});

// start bot
require('./helpers/logic');

// Start http server for webhooks
var http = require('http');
var server = http.createServer((req, res) => {
	console.log(request);
	response.end(`It Works!! Path Hit: ${request.url}`);
});
server.listen(80, () => {
	console.log('Server listening on: 80');
});

// print a message to assure that bot is up and running
console.log('Bot is up and running!');
