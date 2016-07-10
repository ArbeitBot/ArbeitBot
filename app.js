let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let errors = require('./helpers/errors');
let mongoose = require('mongoose');
let config = require('./config');
let fs = require('fs');

let app = express();

// setup mongoose and load all models
mongoose.connect(config.database);
fs.readdirSync(path.join(__dirname, '/models')).forEach(function(filename) {
  if (~filename.indexOf('.js')) {
    require(path.join(__dirname, '/models/', filename))
  }
});

// start bot
require('./helpers/bot');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(errors.notFound());
});

// production error handler
app.use(function(err, req, res, next) {
  res.send(err);
});

console.log('Server is up and running!');

module.exports = app;
