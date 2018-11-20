/**
 * @module models/language
 * @license MIT
 */

/** Dependencies */
const mongoose = require('mongoose')

/** Schema */
const Schema = mongoose.Schema
const languageSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    flag: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
      default: 'strings',
    },
  },
  { usePushEach: true }
)

module.exports = mongoose.model('language', languageSchema)
