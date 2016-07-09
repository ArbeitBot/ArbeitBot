var notFound = function() {
  return error(404, 'Not found');
};
var authEmailNotRegistered = function() {
  return error(403, 'Email not registered');
};
var authWrongPassword = function() {
  return error(403, 'Wrong password');
};
var authTokenFailed = function() {
  return error(403, 'Failed to authenticate token');
};
var authUserAlreadyExists = function() {
  return error(403, 'User already exists');
};
var noApiKey = function() {
  return error(403, 'No API key provided');
};
var fieldNotFound = function(field, status) {
  return error(status || 500, 'No ' + field + ' provided');
};

var error = function(status, msg) {
  var err = new Error();
  err.status = status;
  err.message = msg;
  return err;
};

module.exports = {
  error: error,
  notFound: notFound,
  authEmailNotRegistered: authEmailNotRegistered,
  authWrongPassword: authWrongPassword,
  authTokenFailed: authTokenFailed,
  authUserAlreadyExists: authUserAlreadyExists,
  noApiKey: noApiKey,
  fieldNotFound: fieldNotFound
};