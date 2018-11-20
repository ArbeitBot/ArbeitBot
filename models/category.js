/**
 * @module models/category
 * @license MIT
 */

/** Dependencies */
const mongoose = require('mongoose')

/** Schema */
const Schema = mongoose.Schema
const categorySchema = new Schema(
  {
    title: String,
    freelancers: [
      {
        type: Schema.ObjectId,
        ref: 'user',
        required: true,
        default: [],
      },
    ],
  },
  { usePushEach: true }
)

module.exports = mongoose.model('category', categorySchema)
