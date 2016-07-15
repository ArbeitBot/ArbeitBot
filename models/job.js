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
  current_inline: String,
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
    ref: 'freelancer'
  }, 
  candidates: [{
    type: Schema.ObjectId,
    ref: 'freelancer',
    required: false,
    default: []
  }]
});

mongoose.model('job', jobSchema);