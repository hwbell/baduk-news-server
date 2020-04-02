const mongoose = require('mongoose');
const validator = require('validator');

const ReviewSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  user: {
    type: String,
    // unique: true,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: new Date()
  },
  name: {
    type: String,
    unique: true,
    required: true,
  },
  // we'll just save the s3 url here.
  game: {
    type: String,
    unique: true,
    required: true,
  },
  paragraph: {
    type: String,
    required: true,
  },
  tags: {
    type: Array,
    required: true,
    default: ['#go', '#review']
  },
  comments: {
    type: Array,
    default: []
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  likes: {
    type: Array,
    default: 0
  },
  likesCount: {
    type: Number,
    default: 0
  },
})

ReviewSchema.pre('save', async function (next) {

  // this will assign the commentsCount to the length of the comments
  // so we don't have to do it manually
  this.commentsCount = this.comments.length;
  this.likesCount = this.likes.length;
})

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;