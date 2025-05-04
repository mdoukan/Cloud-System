const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  totalPlayTime: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  },
  comments: [{
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game'
    },
    comment: String,
    playTime: Number
  }],
  ratings: [{
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    playTime: Number
  }]
}, {
  timestamps: true,
  collection: 'users'
});

module.exports = mongoose.model('User', userSchema); 