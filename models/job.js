var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// very basic variant
var jobSchema = new Schema({
  description: String,
  priceRange: String,
  client: {
    type: Schema.ObjectId,
    ref: 'client',
    required: true
  }
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