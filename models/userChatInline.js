/**
 * @module models/userChatInline
 * @license MIT
 */

/** Dependencies */
const mongoose = require('mongoose');

/** Schema */
const userChatInlineSchema = new mongoose.Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'user',
    required: true,
  },
  message_id: {
    type: Number,
    required: true,
  },
  chat_id: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('userChatInline', userChatInlineSchema);
