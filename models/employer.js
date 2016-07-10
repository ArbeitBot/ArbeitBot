var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var employerSchema = new Schema({
  id: Number,
  first_name: String,
  last_name: String,
  username: String
});

employerSchema.methods.name = () => {
  return username || first_name || last_name;
};

mongoose.model('employer', employerSchema);