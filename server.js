const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
console.log('Attempting to connect to MongoDB with URI:', process.env.MONGODB_URI ? 'URI exists' : 'URI is missing');
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB Atlas');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    const User = require('./models/User');
    const Game = require('./models/Game');

    console.log('User model collection:', User.collection.name);
    console.log('Game model collection:', Game.collection.name);

    const userCount = await User.countDocuments();
    const gameCount = await Game.countDocuments();
    console.log(`Found ${userCount} users and ${gameCount} games`);

    try {
      if (gameCount === 0) {
        console.log('No games found in DB, seeding initial data...');
        const sampleGames = [
          {
            name: 'The Witcher 3: Wild Hunt',
            genres: ['RPG', 'Open World'],
            image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg',
            developer: 'CD PROJEKT RED',
            releaseDate: new Date('2015-05-19'),
            description: 'One of the RPG classics.',
            price: 29.99,
            rating: 4.8
          },
          {
            name: 'Red Dead Redemption 2',
            genres: ['Action-Adventure', 'Open World'],
            image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg',
            developer: 'Rockstar Games',
            releaseDate: new Date('2018-10-26'),
            description: 'An epic story set in the Wild West.',
            price: 59.99,
            rating: 4.9
          }
          // Gerekirse daha fazla oyun ekle
        ];
        await Game.insertMany(sampleGames);
        console.log(`${sampleGames.length} sample games seeded successfully.`);
      }

      const testUserExists = await User.findOne({ name: 'Test User' });
      if (!testUserExists) {
        await new User({ name: 'Test User' }).save();
        console.log('Test user created.');
      } else {
        console.log('Test user already exists.');
      }
    } catch (seedError) {
      console.error('Error during seeding:', seedError);
    }
  })
  .catch(err => {
    console.error('MongoDB connection error details:', err.message);
    console.error('Full error stack:', err.stack);
    console.error('Connection string format may be incorrect or database server unavailable');
    process.exit(1);
  });

// Routes
const gameRoutes = require('./routes/gameRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/games', gameRoutes);
app.use('/api/users', userRoutes);

// Basic test route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Game Distribution Service API' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// ✅ Serve React frontend (only in production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client', 'build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
