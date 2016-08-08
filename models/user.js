var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  id: Number,
  first_name: String,
  last_name: String,
  username: String,
  bio: String,
  hourly_rate: String,
  input_state: String,
  input_state_data: String,
  reports: [{
    type: Schema.ObjectId,
    ref: 'report'
  }],
  reportedBy: [{
    type: Schema.ObjectId,
    ref: 'user'
  }],
  reviews: [{
    type: Schema.ObjectId,
    ref: 'review',
    required: true,
    default: []
  }],
  writeReview: [{
    type: Schema.ObjectId,
    ref: 'review',
    required: true,
    default: []
  }],
  busy: {
    type: Boolean,
    required: true,
    default: false
  },
  categories: [{
    type: Schema.ObjectId,
    ref: 'category',
    required: true,
    default: []
  }],
  jobs: [{
    type: Schema.ObjectId,
    ref: 'job',
    required: true,
    default: []
  }],
  job_draft: {
    type: Schema.ObjectId,
    ref: 'job'
  },
  report_draft: {
    type: Schema.ObjectId,
    ref: 'job'
  }
});

mongoose.model('user', userSchema);