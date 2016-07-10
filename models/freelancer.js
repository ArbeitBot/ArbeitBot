var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var freelancerSchema = new Schema({
  id: Number,
  first_name: String,
  last_name: String,
  username: String
});

freelancerSchema.methods.name = () => {
  return username || first_name || last_name;
};

mongoose.model('freelancer', freelancerSchema);