var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// very basic variant
var jobSchema = new Schema({
  Title: String,
  Description: String,
  Deadline: Date,
  Price: Number,
  employer: String, 	// bot_username 
  freelancer: String,	// bot_username 
  candidates: [{
    type: Schema.ObjectId,
    ref: 'freelancer',
    required: false,
    default: []
  }]
});

// employerSchema.methods.name = () => {
//   return username || first_name || last_name;
// };

mongoose.model('job', jobSchema);