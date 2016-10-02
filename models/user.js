const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const strings = require('../helpers/strings');

const userSchema = new Schema({
  id: Number,
  first_name: String,
  last_name: String,
  username: String,
  bio: String,
  hourly_rate: String,
  input_state: String,
  input_state_data: String,
  ban_state: {
    type: Boolean,
    default: false
  },
  rate: {
    type: Number,
    required: true,
    default: 0
  },
  positiveRate: {
    type: Number,
    required: true,
    default: 0
  },
  sortRate: {
    type: Number,
    required: true,
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
  },
  specialSymbol: String
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
    let tPRate = 0;
    this.reviews.forEach(review => {
      if (review.rate > 3) tPRate += 1;
      tRate += review.rate;
    });
    this.rate = tRate;
    this.positiveRate = tPRate;
    this.save();
    this.UpdateSortRate();
  },
  UpdateSortRate: function(save = true) {
    if (this.reviews.length === 0) return;

    const rCount = this.reviews.length;
    //const confidence = 0.95;
    const z = 1.96;//for 0.95 //pnormaldist(1-(1-confidence)/2)
    const phat = 1.0*this.positiveRate/rCount;
    this.sortRate = ((phat + z*z/(2*rCount) - z * Math.sqrt((phat*(1-phat)+z*z/(4*rCount))/rCount))/(1+z*z/rCount)).toFixed(4);
    if (save) this.save();
  }
};

mongoose.model('user', userSchema);