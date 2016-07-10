var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var freelancerSchema = new Schema({
  id: Number,
  first_name: String,
  last_name: String,
  username: String,
  bot_username: String,
  categories: [{
    type: Schema.ObjectId,
    ref: 'category',
    required: true,
    default: []
  }]
});

freelancerSchema.methods.name = () => {
  return username || first_name || last_name;
};

mongoose.model('freelancer', freelancerSchema);