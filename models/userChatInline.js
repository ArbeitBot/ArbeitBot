/**
 * @module models/userChatInline
 * @license MIT
 */

/** Dependencies */
const mongoose = require('mongoose')

/** Schema */
const Schema = mongoose.Schema
const userChatInlineSchema = new Schema(
  {
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
  },
  { usePushEach: true }
)

module.exports = mongoose.model('userChatInline', userChatInlineSchema)
