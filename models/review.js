/**
 * @module models/review
 * @license MIT
 */

/** Dependencies */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const reviewSchema = new Schema({
  byUser: {
    type: Schema.ObjectId,
    ref: 'user',
  },
  toUser: {
    type: Schema.ObjectId,
    ref: 'user',
  },
  job: {
    type: Schema.ObjectId,
    ref: 'job',
  },
  rate: {
    type: Number,
    required: true,
  },
  reviewType: {
    type: String,
    required: true,
  },

  /** OK Delete Ban */
  resolveWay: { type: String },

  /** has the format of message_id+chat.id */
  /** like this: '1233+333455' */
  inlineMessages: [{ type: String }],
});

mongoose.model('review', reviewSchema);
