var mongoose = require('mongoose');
var Schema = mongoose.Schema;
let strings = require('../helpers/strings');

var userSchema = new Schema({
  id: Number,
  first_name: String,
  last_name: String,
  username: String,
  bio: String,
  hourly_rate: String,
  input_state: String,
  input_state_data: String,
  rate: {
    type: Number,
    default: 0
  },
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


userSchema.methods = {
  /**
   * @return {string}
   */
  GetRate: function() {
    return this.rate ? (this.rate / this.reviews.length).toFixed(1) : 0;
  },
  /**
   * @return {string}
   */
  GetRateStars: function() {
    let ret = '';
    for (let i = 0; i < Math.round(this.rate / this.reviews.length); i++) {
      ret += strings.star;
    }
    return ret;
  },
  UpdateRate: function() {
    let tRate = 0;
    this.reviews.forEach(review => {
      tRate += review.rate;
    });
    console.log('tr', tRate);
    this.rate = tRate;
    this.save();
  }
};

mongoose.model('user', userSchema);