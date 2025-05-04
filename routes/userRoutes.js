const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Game = require('../models/Game');

router.post('/add', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error in GET /users:', error);
    res.status(500).json({ message: error.message });
  }
});


router.delete('/remove/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    
    for (const rating of user.ratings) {
      const game = await Game.findById(rating.gameId);
      if (game) {
        game.rating = (game.rating * game.playTime - rating.rating * rating.playTime) / 
                     (game.playTime - rating.playTime);
        game.playTime -= rating.playTime;
        await game.save();
      }
    }

    
    for (const comment of user.comments) {
      await Game.updateOne(
        { _id: comment.gameId },
        { $pull: { allComments: { userId: user._id } } }
      );
    }

    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Error in DELETE /users/remove:', error);
    res.status(500).json({ message: error.message });
  }
});


router.post('/rate/:userId/:gameId', async (req, res) => {
  console.log('--- Rate Game Request ---');
  console.log('Params:', req.params);
  console.log('Body:', req.body);
  try {
    
    const { rating } = req.body; 
    const { userId, gameId } = req.params;

    
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Geçersiz puan değeri.' });
    }

    const user = await User.findById(userId);
    const game = await Game.findById(gameId);

    if (!user || !game) {
      console.log('User or Game not found for rating.');
      return res.status(404).json({ message: 'Kullanıcı veya oyun bulunamadı.' });
    }

    if (!game.isRatingEnabled) {
       console.log('Rating disabled for this game.');
      return res.status(400).json({ message: 'Bu oyun için puanlama devre dışı.' });
    }

    
    const ratingEntry = user.ratings.find(r => r.gameId.toString() === gameId);
    if (!ratingEntry || (ratingEntry.playTime || 0) < 1) {
      console.log('User has not played enough to rate.');
      return res.status(400).json({ message: 'Oyunu puanlamak için en az 1 saat oynamış olmalısınız.' });
    }

    
    ratingEntry.rating = rating;
    console.log('Updating existing rating for user.');
   
    
    const gameRatings = await User.find({ 'ratings.gameId': gameId }, { 'ratings.$': 1 });
    let totalRatingSum = 0;
    let ratingCount = 0;
    gameRatings.forEach(u => {
        u.ratings.forEach(r => {
            if (r.gameId.toString() === gameId && typeof r.rating === 'number') { 
                totalRatingSum += r.rating;
                ratingCount++;
            }
        });
    });
    game.rating = ratingCount > 0 ? (totalRatingSum / ratingCount) : 0;
    console.log(`Recalculated game rating: ${game.rating} based on ${ratingCount} ratings.`);

    await user.save();
    await game.save();

    console.log('Rating saved successfully.');
    res.json({ message: 'Puan başarıyla güncellendi.' }); 
  } catch (error) {
    console.error('Error in POST /rate/:userId/:gameId:', error);
    res.status(500).json({ message: error.message });
  }
});


router.post('/play/:userId/:gameId', async (req, res) => {
  console.log('--- Play Game Request ---');
  console.log('Params:', req.params);
  console.log('Body:', req.body);
  try {
    const { playTime } = req.body;
    const { userId, gameId } = req.params;

    if (typeof playTime !== 'number' || playTime <= 0) {
        return res.status(400).json({ message: 'Invalid playTime value' });
    }

    const user = await User.findById(userId);
    const game = await Game.findById(gameId);

    if (!user || !game) {
      console.log('User or Game not found for playing.');
      return res.status(404).json({ message: 'User or game not found' });
    }

    
    user.totalPlayTime = (user.totalPlayTime || 0) + playTime;
    console.log(`Updated user totalPlayTime to: ${user.totalPlayTime}`);

    
    game.playTime = (game.playTime || 0) + playTime; 
    console.log(`Updated game playTime to: ${game.playTime}`);

    
    const existingRatingIndex = user.ratings.findIndex(r => r.gameId.toString() === gameId);
    if (existingRatingIndex !== -1) {
      
      user.ratings[existingRatingIndex].playTime = (user.ratings[existingRatingIndex].playTime || 0) + playTime;
      console.log(`Updated playTime in user rating entry: ${user.ratings[existingRatingIndex].playTime}`);
    } else {
      
      user.ratings.push({
        gameId,
        playTime,
        rating: null 
      });
      console.log(`Added new entry to user ratings with playTime: ${playTime}`);
    }

    

    await user.save();
    await game.save();

    console.log('Play time saved successfully.');
    res.json({ message: 'Play time updated successfully' });
  } catch (error) {
    console.error('Error in POST /play/:userId/:gameId:', error);
    res.status(500).json({ message: error.message });
  }
});


router.post('/comment/:userId/:gameId', async (req, res) => {
  console.log('--- Comment Game Request ---');
  console.log('Params:', req.params);
  console.log('Body:', req.body);
  try {
    
    const { comment } = req.body; 
    const { userId, gameId } = req.params;

    if (!comment || typeof comment !== 'string' || comment.trim() === '') {
      return res.status(400).json({ message: 'Yorum boş olamaz.' });
    }

    const user = await User.findById(userId);
    const game = await Game.findById(gameId);

    if (!user || !game) {
      console.log('User or Game not found for commenting.');
      return res.status(404).json({ message: 'Kullanıcı veya oyun bulunamadı.' });
    }

    if (!game.isRatingEnabled) { // Assuming commenting is tied to rating enabled status
      console.log('Commenting disabled for this game.');
      return res.status(400).json({ message: 'Bu oyun için yorum yapma devre dışı.' });
    }

    // Check if user has played enough
    const ratingEntry = user.ratings.find(r => r.gameId.toString() === gameId);
    if (!ratingEntry || (ratingEntry.playTime || 0) < 1) {
      console.log('User has not played enough to comment.');
      return res.status(400).json({ message: 'Oyuna yorum yapmak için en az 1 saat oynamış olmalısınız.' });
    }

    // Add comment to game's comment list
    game.allComments.push({
      userId,
      username: user.name,
      comment: comment.trim(),
      // playTime: ratingEntry.playTime // Optionally store the playtime when comment was made
      createdAt: new Date() // Add timestamp for the comment
    });
    console.log('Added comment to game.allComments.');

    // We are not modifying user document here, so no need to save user
    await game.save();

    console.log('Comment saved successfully.');
    // Return the newly added comment or a success message
    res.status(201).json({ message: 'Yorum başarıyla eklendi.' }); 
  } catch (error) {
    console.error('Error in POST /comment/:userId/:gameId:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create test user
router.post('/test', async (req, res) => {
  try {
    // Check if test user already exists
    let testUser = await User.findOne({ name: 'Test User' });
    
    if (!testUser) {
      testUser = new User({
        name: 'Test User',
        totalPlayTime: 0,
        averageRating: 0,
        comments: [],
        ratings: []
      });
      await testUser.save();
    }
    
    res.json({
      message: 'Test user created/retrieved successfully',
      userId: testUser._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID with populated game data
router.get('/:id', async (req, res) => {
  console.log(`Fetching user profile for ID: ${req.params.id}`);
  try {
    // Fetch user and populate game details within ratings
    const user = await User.findById(req.params.id).populate('ratings.gameId', 'name image'); // Populate game name and image from Game model
    
    if (!user) {
      console.log('User not found.');
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate average rating (simple average based on user's ratings)
    let totalRatingSum = 0;
    user.ratings.forEach(rating => {
        totalRatingSum += rating.rating;
    });
    const averageRating = user.ratings.length > 0 ? (totalRatingSum / user.ratings.length).toFixed(1) : 'N/A';

    // Prepare played games list from populated ratings
    const playedGames = user.ratings.map(r => ({
      _id: r.gameId?._id, // Use populated game _id
      name: r.gameId?.name || 'Bilinmeyen Oyun', // Use populated game name
      image: r.gameId?.image, // Use populated game image
      userPlayTime: r.playTime || 0,
      userRating: r.rating
    })).sort((a, b) => b.userPlayTime - a.userPlayTime); // Sort by play time desc

    // Get all games that have comments from this user
    const gamesWithComments = await Game.find({ 'allComments.userId': user._id });
    const userComments = gamesWithComments.map(game => {
      const comments = game.allComments.filter(comment => comment.userId.toString() === user._id.toString());
      return comments.map(comment => ({
        gameId: game._id,
        gameName: game.name,
        gameImage: game.image,
        comment: comment.comment,
        createdAt: comment.createdAt
      }));
    }).flat();

    // Determine most played game from the prepared list
    const mostPlayedGameInfo = playedGames.length > 0 ? playedGames[0] : null;
    const mostPlayedGameName = mostPlayedGameInfo ? mostPlayedGameInfo.name : 'Yok';

    // Keep total play time calculation (sum of all play times in ratings)
    const totalPlayTime = user.ratings.reduce((sum, r) => sum + (r.playTime || 0), 0);

    console.log('Successfully fetched and processed user data.');
    res.json({
      _id: user._id,
      name: user.name,
      averageRating: averageRating,
      totalPlayTime: totalPlayTime,
      mostPlayedGame: mostPlayedGameName,
      playedGames: playedGames,
      comments: userComments
    });

  } catch (error) {
    console.error(`Error in GET /users/${req.params.id}:`, error);
    // Handle potential CastError for userId
    if (error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 