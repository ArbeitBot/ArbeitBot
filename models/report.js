var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var reportSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'user',
    required: true
  },
  message: String
});

mongoose.model('report', reportSchema);