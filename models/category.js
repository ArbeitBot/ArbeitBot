const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  title: String,
  freelancers: [{
    type: Schema.ObjectId,
    ref: 'user',
    required: true,
    default: []
  }]
});

mongoose.model('category', categorySchema);