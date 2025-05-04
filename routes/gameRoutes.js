const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const User = require('../models/User');

// Add a new game
router.post('/add', async (req, res) => {
  try {
    const game = new Game(req.body);
    await game.save();
    res.status(201).json(game);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove a game
router.delete('/remove/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Update users who played this game
    await User.updateMany(
      { 'ratings.gameId': game._id },
      { $pull: { ratings: { gameId: game._id } } }
    );

    await User.updateMany(
      { 'comments.gameId': game._id },
      { $pull: { comments: { gameId: game._id } } }
    );

    await Game.deleteOne({ _id: game._id });
    res.json({ message: 'Game removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle rating and comment status
router.patch('/toggle-rating/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    game.isRatingEnabled = !game.isRatingEnabled;
    await game.save();
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all games
router.get('/', async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single game
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    // Handle potential CastError if the ID format is invalid
    if (error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid game ID format' });
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 