var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categorySchema = new Schema({
  title: String,
  freelancers: [{
    type: Schema.ObjectId,
    ref: 'user',
    required: true,
    default: []
  }]
});

mongoose.model('category', categorySchema);