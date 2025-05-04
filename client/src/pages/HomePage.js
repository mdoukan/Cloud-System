import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Navbar, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAllGames, getAllUsers, addUser, removeUser, addGame, removeGame, toggleGameRating } from '../services/api';

const HomePage = () => {
  const [games, setGames] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [newGame, setNewGame] = useState({
    name: '',
    genres: '',
    photo: '',
    optional1: '',
    optional2: ''
  });
  const [newUser, setNewUser] = useState({ name: '' });
  const [loginUsername, setLoginUsername] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGames();
    fetchUsers();
    // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgisini al
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchGames = async () => {
    try {
      const data = await getAllGames();
      setGames(data);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      console.log('Fetched users:', data);
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error loading users');
    }
  };

  const handleAddGame = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setSuccess('');
    try {
      // Ensure genres are split into an array
      const genresArray = newGame.genres.split(',').map(genre => genre.trim()).filter(g => g); // Trim and remove empty strings
      if (genresArray.length === 0) {
          setError('You must enter at least one genre.');
          return;
      }
      
      const gameData = {
        name: newGame.name,
        genres: genresArray,
        image: newGame.image, // Use the correct field name 'image'
        // Add other optional fields from the form if they exist in newGame state
        // developer: newGame.developer,
        // releaseDate: newGame.releaseDate,
        // price: newGame.price,
        // description: newGame.description,
      };
      
      await addGame(gameData);
      
      setNewGame({ name: '', genres: '', image: '' }); // Reset form fields
      setSuccess('Game successfully added.');
      fetchGames(); // Refresh the games list shown on the page
    } catch (error) {
      console.error('Error adding game:', error);
      setError(error.response?.data?.message || 'An error occurred while adding the game.');
    }
  };

  const handleRemoveGame = async () => {
    if (!selectedGame) {
        setError('Please select a game to delete.');
        return;
    }
    setError(''); // Clear previous errors
    setSuccess('');
    try {
      await removeGame(selectedGame);
      setSuccess('Game successfully deleted.');
      setSelectedGame(''); // Reset selection
      fetchGames(); // Refresh game list
    } catch (error) {
      console.error('Error removing game:', error);
      setError(error.response?.data?.message || 'An error occurred while deleting the game.');
    }
  };

  const handleToggleRating = async (enable) => {
    if (!selectedGame) {
       setError('Please select a game to perform the action.');
       return;
    }
    setError(''); // Clear previous errors
    setSuccess('');
    try {
      await toggleGameRating(selectedGame);
      setSuccess(`Rating/review status for the game was successfully changed.`);
      fetchGames(); // Refresh game list to show updated status if displayed
    } catch (error) {
      console.error('Error toggling rating:', error);
      setError(error.response?.data?.message || 'An error occurred while changing the rating status.');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await addUser(newUser);
      setNewUser({ name: '' });
      setSuccess('User successfully created');
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      setError('An error occurred while creating the user');
    }
  };

  const handleRemoveUser = async (userIdToRemove) => {
    if (!userIdToRemove) return; // Basic check
    setError('');
    setSuccess('');
    try {
      await removeUser(userIdToRemove);
      setSuccess('User successfully deleted.');
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error('Error removing user:', error);
      setError(error.response?.data?.message || 'An error occurred while deleting the user.');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!loginUsername) {
      setError('Please enter a username');
      return;
    }

    console.log('Current users state:', users);
    console.log('Attempting to login with username:', loginUsername);
    
    const user = users.find(u => u.name.toLowerCase() === loginUsername.toLowerCase());
    console.log('Found user:', user);

    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // --- Trigger authChange event for App.js --- 
      window.dispatchEvent(new Event('authChange'));
      // -------------------------------------------

      setSuccess('Login successful');
      setLoginUsername('');
      navigate(`/user/${user._id}`);
    } else {
      setError('User not found');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setSuccess('Logged out');
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" className="mb-4">
        <Container>
          <Navbar.Brand>Game Distribution Service</Navbar.Brand>
          <Nav className="ms-auto">
            {currentUser ? (
              <>
                <Navbar.Text className="me-3">
                  Welcome, {currentUser.name}
                </Navbar.Text>
                <Button variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : null}
          </Nav>
        </Container>
      </Navbar>

      <Container className="mt-4">
        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

        <Row>
          <Col md={6}>
            <Card className="mb-4">
              <Card.Header>Add Game</Card.Header>
              <Card.Body>
                <Form onSubmit={handleAddGame}>
                  <Form.Group className="mb-3">
                    <Form.Label>Game Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={newGame.name}
                      onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Genres (comma-separated)</Form.Label>
                    <Form.Control
                      type="text"
                      value={newGame.genres}
                      onChange={(e) => setNewGame({ ...newGame, genres: e.target.value })}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Image URL</Form.Label>
                    <Form.Control
                      type="text"
                      value={newGame.image}
                      onChange={(e) => setNewGame({ ...newGame, image: e.target.value })}
                      required
                      placeholder="https://..."
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Optional Attribute 1</Form.Label>
                    <Form.Control
                      type="text"
                      value={newGame.optional1}
                      onChange={(e) => setNewGame({ ...newGame, optional1: e.target.value })}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Optional Attribute 2</Form.Label>
                    <Form.Control
                      type="text"
                      value={newGame.optional2}
                      onChange={(e) => setNewGame({ ...newGame, optional2: e.target.value })}
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit">Add Game</Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="mb-4 shadow-sm">
              <Card.Header>Login</Card.Header>
              <Card.Body>
                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your username"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="w-100">
                    Login
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Card className="mb-4">
              <Card.Header>Game Actions</Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Select Game</Form.Label>
                  <Form.Select
                    value={selectedGame}
                    onChange={(e) => { setSelectedGame(e.target.value); setError(''); setSuccess(''); }}
                    aria-label="Select Game to manage"
                  >
                    <option value="">Select a game...</option>
                    {games.map(game => (
                      <option key={game._id} value={game._id}>{game.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <div className="d-grid gap-2">
                  <Button variant="danger" onClick={handleRemoveGame} disabled={!selectedGame}>Delete Selected Game</Button>
                  <Button variant="warning" onClick={() => handleToggleRating(false)} disabled={!selectedGame}>Disable Rating/Review</Button>
                  <Button variant="success" onClick={() => handleToggleRating(true)} disabled={!selectedGame}>Enable Rating/Review</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="mb-4 shadow-sm">
              <Card.Header>Create New User</Card.Header>
              <Card.Body>
                <Form onSubmit={handleAddUser}>
                  <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ name: e.target.value })}
                      required
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="w-100">
                    Create User
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col>
            <Card>
              <Card.Header>Games List</Card.Header>
              <Card.Body>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Genres</th>
                      <th>Play Time</th>
                      <th>Rating</th>
                      <th>Rating Enabled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {games.map(game => (
                      <tr key={game._id}>
                        <td>{game.name}</td>
                        <td>{game.genres.join(', ')}</td>
                        <td>{game.playTime?.toFixed(1) || 0}</td>
                        <td>{game.rating?.toFixed(1) || 'N/A'}</td>
                        <td>{game.isRatingEnabled ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col>
            <Card className="shadow-sm mt-4">
              <Card.Header>User List</Card.Header>
              <Card.Body>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>
                          <Button 
                            variant="primary" 
                            size="sm"
                            className="me-2"
                            onClick={() => navigate(`/user/${user._id}`)}
                          >
                            View Profile
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleRemoveUser(user._id)}
                          >
                            Delete User
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default HomePage; 