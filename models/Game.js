const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  genres: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length >= 1 && v.length <= 5;
      },
      message: 'Game must have between 1 and 5 genres'
    }
  },
  image: {
    type: String,
    required: true
  },
  playTime: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  allComments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    comment: String,
    playTime: Number
  }],
  isRatingEnabled: {
    type: Boolean,
    default: true
  },
  
  releaseDate: {
    type: Date,
    required: false
  },
  developer: {
    type: String,
    required: false
  },
  publisher: {
    type: String,
    required: false
  },
  price: {
    type: Number,
    required: false,
    default: 0
  },
  description: {
    type: String,
    required: false
  }
}, {
  timestamps: true,
  collection: 'games'
});

module.exports = mongoose.model('Game', gameSchema); 