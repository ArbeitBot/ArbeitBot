var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userChatInlineSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'user',
    required: true
  },
  message_id: {
    type: Number,
    required: true
  },
  chat_id: {
    type: Number,
    required: true
  }
});

mongoose.model('userChatInline', userChatInlineSchema);