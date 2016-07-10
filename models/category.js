var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categorySchema = new Schema({
  title: String
});

mongoose.model('category', categorySchema);