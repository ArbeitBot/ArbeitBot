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
  description: String,
  hourly_rate: String,
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
  freelancer: {
    type: Schema.ObjectId,
    ref: 'user'
  }, 
  candidates: [{
    type: Schema.ObjectId,
    ref: 'user',
    required: false,
    default: []
  }],
  interestedCandidates: [{
    type: Schema.ObjectId,
    ref: 'user',
    required: false,
    default: []
  }],
  notInterestedCandidates: [{
    type: Schema.ObjectId,
    ref: 'user',
    required: false,
    default: []
  }],
  // removedCandidates: [{
  //   type: Schema.ObjectId,
  //   ref: 'freelancer',
  //   required: false,
  //   default: []
  // }]
});

mongoose.model('job', jobSchema);