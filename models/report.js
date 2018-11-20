/**
 * @module models/report
 * @license MIT
 */

/** Dependencies */
const mongoose = require('mongoose')

/** Schema */
const Schema = mongoose.Schema
const reportSchema = new Schema(
  {
    sendBy: {
      type: Schema.ObjectId,
      ref: 'user',
      required: true,
    },
    sendTo: {
      type: Schema.ObjectId,
      ref: 'user',
      required: true,
    },
    job: {
      type: Schema.ObjectId,
      ref: 'job',
      required: true,
    },

    /** has the format of message_id+chat.id */
    /** like this: '1233+333455' */
    inlineMessages: [{ type: String }],
    resolved: {
      type: Boolean,
      default: false,
    },
  },
  { usePushEach: true }
)

module.exports = mongoose.model('report', reportSchema)
