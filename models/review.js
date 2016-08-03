var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var reviewSchema = new Schema({
  byUser: {
    type: Schema.ObjectId,
    ref: 'user'
  },
  toUser: {
    type: Schema.ObjectId,
    ref: 'user'
  },
  job: {
    type: Schema.ObjectId,
    ref: 'job'
  },
  rate: {
    type: Number,
    required: true
  },
  review: String,
  reviewType: {
    type: String,
    required: true
  }
});

mongoose.model('review', reviewSchema);