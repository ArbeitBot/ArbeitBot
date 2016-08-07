let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let strings = require('../helpers/strings');

// very basic variant
var jobSchema = new Schema({
  state: {
    type: String,
    required: true,
    default: strings.jobStates.searchingForFreelancer
  },
  current_inline_message_id: String,
  current_inline_chat_id: String,
  freelancer_chat_inlines: [{
    type: Schema.ObjectId,
    ref: 'userChatInline',
    required: true,
    default: []
  }],
  description: String,
  hourly_rate: String,
  reports: [{
    type: Schema.ObjectId,
    ref: 'report'
  }],
  reportedBy: [{
    type: Schema.ObjectId,
    ref: 'user'
  }],
  category: {
    type: Schema.ObjectId,
    ref: 'category',
    required: true
  },
  client: {
    type: Schema.ObjectId,
    ref: 'client',
    required: true
  },
  candidates: [{
    type: Schema.ObjectId,
    ref: 'user',
    required: true,
    default: []
  }],
  interestedCandidates: [{
    type: Schema.ObjectId,
    ref: 'user',
    required: true,
    default: []
  }],
  notInterestedCandidates: [{
    type: Schema.ObjectId,
    ref: 'user',
    required: false,
    default: []
  }],
  selectedCandidate: {
    type: Schema.ObjectId,
    ref: 'user'
  }, 
});

mongoose.model('job', jobSchema);