/**
 * @module models/job
 * @license MIT
 */

/** Dependencies */
const mongoose = require('mongoose');
const strings = require('../helpers/strings');

/** Schema */
const Schema = mongoose.Schema;
const jobSchema = new Schema({
  state: {
    type: String,
    required: true,
    default: strings.jobStates.searchingForFreelancer,
  },
  current_inline_message_id: String,
  current_inline_chat_id: String,
  freelancer_chat_inlines: [{
    type: Schema.ObjectId,
    ref: 'userChatInline',
    required: true,
    default: [],
  }],
  language: {
    type: Schema.ObjectId,
    ref: 'language',
  },
  description: String,
  hourly_rate: String,
  reviewByClient: {
    type: Schema.ObjectId,
    ref: 'review',
  },
  reviewByFreelancer: {
    type: Schema.ObjectId,
    ref: 'review',
  },
  reports: [{
    type: Schema.ObjectId,
    ref: 'report',
  }],
  reportedBy: [{
    type: Schema.ObjectId,
    ref: 'user',
  }],
  category: {
    type: Schema.ObjectId,
    ref: 'category',
    required: true,
  },
  client: {
    type: Schema.ObjectId,
    ref: 'user',
    required: true,
  },
  candidates: [{
    type: Schema.ObjectId,
    ref: 'user',
    required: true,
    default: [],
  }],
  interestedCandidates: [{
    type: Schema.ObjectId,
    ref: 'user',
    required: true,
    default: [],
  }],
  notInterestedCandidates: [{
    type: Schema.ObjectId,
    ref: 'user',
    required: false,
    default: [],
  }],
  selectedCandidate: {
    type: Schema.ObjectId,
    ref: 'user',
  },
  current_page: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('job', jobSchema);
