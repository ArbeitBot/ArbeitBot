var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var reportSchema = new Schema({
  sendBy: {
    type: Schema.ObjectId,
    ref: 'user',
    required: true
  },
  sendTo: {
    type: Schema.ObjectId,
    ref: 'user',
    required: true
  },
  job: {
    type: Schema.ObjectId,
    ref: 'job',
    required: true
  }
});

mongoose.model('report', reportSchema);