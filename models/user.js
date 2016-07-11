var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  id: Number,
  first_name: String,
  last_name: String,
  username: String,
  busy: {
    type: Boolean,
    required: true,
    default: false
  },
  categories: [{
    type: Schema.ObjectId,
    ref: 'category',
    required: true,
    default: []
  }],
  jobs: [{
    type: Schema.ObjectId,
    ref: 'job',
    required: true,
    default: []
  }]
});

userSchema.methods.name = () => {
  return username || first_name || last_name;
};

mongoose.model('user', userSchema);