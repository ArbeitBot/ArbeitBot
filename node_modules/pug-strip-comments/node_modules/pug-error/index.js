'use strict';

module.exports = makeError;
function makeError(code, message, options) {
  var line = options.line;
  var column = options.column;
  var filename = options.filename;
  var src = options.src;
  var fullMessage;
  var location = line + (column ? ':' + column : '');
  if (src) {
    var lines = src.split('\n');
    var start = Math.max(line - 3, 0);
    var end = Math.min(lines.length, line + 3);
    // Error context
    var context = lines.slice(start, end).map(function(text, i){
      var curr = i + start + 1;
      var preamble = (curr == line ? '  > ' : '    ')
        + curr
        + '| ';
      var out = preamble + text;
      if (curr === line && column) {
        out += '\n';
        out += Array(preamble.length + column).join('-') + '^';
      }
      return out;
    }).join('\n');
    fullMessage = (filename || 'Jade') + ':' + location + '\n' + context + '\n\n' + message;
  } else {
    fullMessage = (filename || 'Jade') + ':' + location + '\n\n' + message;
  }
  var err = new Error(fullMessage);
  err.code = 'JADE:' + code;
  err.msg = message;
  err.line = line;
  err.column = column;
  err.filename = filename;
  err.src = src;
  err.toJSON = function () {
    return {
      code: this.code,
      msg: this.msg,
      line: this.line,
      column: this.column,
      filename: this.filename
    };
  };
  return err;
}
