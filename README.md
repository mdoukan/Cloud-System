# Game Distribution Service

A cloud-based video game distribution service that allows users to browse, play, rate, and comment on games.

## Features

- Add and remove games
- Add and remove users
- Play games and track play time
- Rate games (1-5 stars)
- Comment on games
- Enable/disable rating and commenting for games
- View user profiles with play statistics
- View game details with ratings and comments

## Technical Stack

- Backend: Node.js with Express
- Database: MongoDB Atlas
- Frontend: React (to be implemented)
- Deployment: To be determined (PaaS platform)

## API Endpoints

### Games
- `POST /api/games/add` - Add a new game
- `DELETE /api/games/remove/:id` - Remove a game
- `PATCH /api/games/toggle-rating/:id` - Toggle rating/commenting for a game
- `GET /api/games` - Get all games
- `GET /api/games/:id` - Get a specific game

### Users
- `POST /api/users/add` - Add a new user
- `DELETE /api/users/remove/:id` - Remove a user
- `POST /api/users/rate/:userId/:gameId` - Rate a game
- `POST /api/users/play/:userId/:gameId` - Play a game
- `POST /api/users/comment/:userId/:gameId` - Comment on a game
- `GET /api/users/:id` - Get user details

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the server:
   ```bash
   npm start
   ```

## Project Requirements

- At least 10 different games
- At least 10 different users
- At least 3 users with:
  - Played more than 3 games
  - Rated 2 games
  - Commented on 2 games
- At least 3 games with optional fields filled

## License

MIT 