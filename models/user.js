/**
 * @module models/user
 * @license MIT
 */

/** Dependencies */
const mongoose = require('mongoose');
const strings = require('../helpers/strings');

/** Schema */
const Schema = mongoose.Schema;
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
    default: false,
  },
  rate: {
    type: Number,
    required: true,
    default: 0,
  },
  positiveRate: {
    type: Number,
    required: true,
    default: 0,
  },
  sortRate: {
    type: Number,
    required: true,
    default: 0,
  },
  reports: [{
    type: Schema.ObjectId,
    ref: 'report',
  }],
  reportedBy: [{
    type: Schema.ObjectId,
    ref: 'user',
  }],
  reviews: [{
    type: Schema.ObjectId,
    ref: 'review',
    required: true,
    default: [],
  }],
  writeReview: [{
    type: Schema.ObjectId,
    ref: 'review',
    required: true,
    default: [],
  }],
  busy: {
    type: Boolean,
    required: true,
    default: false,
  },
  categories: [{
    type: Schema.ObjectId,
    ref: 'category',
    required: true,
    default: [],
  }],
  languages: [{
    type: Schema.ObjectId,
    ref: 'language',
  }],
  interfaceLanguage: {
    type: Schema.ObjectId,
    ref: 'language',
  },
  jobs: [{
    type: Schema.ObjectId,
    ref: 'job',
    required: true,
    default: [],
  }],
  job_drafts: [{
    type: Schema.ObjectId,
    ref: 'job',
    requred: true,
    default: [],
  }],
  current_job_draft: {
    type: Schema.ObjectId,
    ref: 'job',
  },
  report_draft: {
    type: Schema.ObjectId,
    ref: 'job',
  },
  specialSymbol: String,
  unsubscribefromGodvoice: {
    type: Boolean,
    required: true,
    default: false,
  }
});

/** Functionality */
userSchema.methods = {
  /** @return {String} */
  GetRate() {
    return this.rate ? (this.rate / this.reviews.length).toFixed(1) : 0;
  },

  /** @return {String} */
  getRateStars() {
    let ret = '';

    for (let i = 0; i < Math.round(this.rate / this.reviews.length); i += 1) {
      ret += strings().star;
    }

    return ret;
  },

  updateRate() {
    let tRate = 0;
    let tPRate = 0;

    this.reviews.forEach((review) => {
      if (review.rate > 3) tPRate += 1;
      tRate += review.rate;
    });

    this.rate = tRate;
    this.positiveRate = tPRate;
    this.save();
    this.updateSortRate();
  },

  updateSortRate(save = true) {
    if (this.reviews.length === 0) return;

    const rCount = this.reviews.length;
    // const confidence = 0.95;
    const z = 1.96;// for 0.95 // pnormaldist(1-(1-confidence)/2)
    const phat = 1.0 * (this.positiveRate / rCount);

    /** this magic equation comes from here: http://www.evanmiller.org/how-not-to-sort-by-average-rating.html */
    this.sortRate = ((phat + z * z / (2 * rCount) - z * Math.sqrt((phat * ( 1 - phat) + z * z / (4 * rCount)) / rCount)) / (1 + z * z / rCount)).toFixed(4); // eslint-disable-line

    if (save) this.save();
  },

  /** @return {String} */
  getTextToShareProfile() {
    let text = `Name: ${this.first_name} ${(this.last_name) ? this.last_name : ''}\n` +
               `Rating: ${this.getRateStars()}(${this.reviews.length})\n` +
               `Bio: ${(this.bio) ? this.bio : ''}\n` +
               `Hourly rate: ${(this.hourly_rate) ? this.hourly_rate : '0'}\n`;

    if (this.categories.length > 0) {
      text += 'Categories: ';
      this.categories.forEach((cat) => {
        text += `[${cat.title}]`;
      });
    }

    return text;
  },
};

module.exports = mongoose.model('user', userSchema);
