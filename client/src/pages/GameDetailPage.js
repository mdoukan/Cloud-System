import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Alert } from 'react-bootstrap';
import { FaStar, FaCalendarAlt, FaDollarSign, FaPlay, FaComment } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getGameById, rateGame, playGame, commentOnGame } from '../services/api';


const descriptionTranslations = {
  'Yeraltı dünyasından kaçış.': 'Escape from the underworld.',
  'Yaratıcılığın sınır tanımadığı dünya.': 'A world where creativity knows no bounds.',
  'Kratos\'un Norveç macerası.': 'Kratos\'s adventure in Norway.',
  
  'RPG klasiklerinden biri.': 'One of the RPG classics.',
  'Vahşi Batı\'da geçen epik bir hikaye.': 'An epic story set in the Wild West.',
  'Post-apokaliptik bir dünyada hayatta kalma.': 'Survival in a post-apocalyptic world.',
  'Uzay keşif macerası.': 'A space exploration adventure.',
  'Fantastik bir dünyada strateji savaşları.': 'Strategy battles in a fantastic world.',
  'Modern savaş simülasyonu.': 'Modern warfare simulation.',
  'Korku ve gerilimin doruğu.': 'The pinnacle of horror and suspense.',
  'Bulmaca odaklı platform oyunu.': 'A puzzle-focused platform game.',
  'Suç dünyasının en derinlerine yolculuk.': 'A journey into the depths of the criminal world.',
  'Bir futbol simülasyonu.': 'A football simulation.',
  'Hız ve yarış tutkunları için.': 'For speed and racing enthusiasts.',
  'Aksiyon dolu spor simülasyonu.': 'Action-packed sports simulation.',
  'Zombi kıyameti sonrası hayatta kalma.': 'Post-zombie apocalypse survival.',
  'Doğal yaşamı keşfet.': 'Explore the natural world.',
  'Orta çağda geçen strateji oyunu.': 'A strategy game set in the Middle Ages.',
  'Antik uygarlıkları yönet.': 'Manage ancient civilizations.',
  'Büyülü bir dünyada macera.': 'Adventure in a magical world.',
  'Uzay gemisiyle galaksileri keşfet.': 'Explore galaxies with your spaceship.',
  'Sürükleyici bir suç hikayesi.': 'An immersive crime story.',
  'Dijital dünyada hayatta kalma.': 'Survival in a digital world.',
  'Fantastik savaşlar ve büyüler.': 'Fantastic battles and magic.',
  'Sanal dünyada hayat simülasyonu.': 'Life simulation in a virtual world.',
  
  'Zorlu düşmanlar ve geniş bir dünya.': 'Challenging enemies and a vast world.',
  'Makinelerin hükmettiği bir dünya.': 'A world ruled by machines.',
  'Unutulmuş Diyarlar\'da bir macera.': 'An adventure in the Forgotten Realms.',
  'Zeka zorlayan bulmacalar ve mizah.': 'Mind-bending puzzles and humor.',
  'Galaksiyi kurtarma görevi.': 'A mission to save the galaxy.',
  'An epic story set in the Wild West.': 'An epic story set in the Wild West.' 
};


const translateDescription = (description) => {
  return descriptionTranslations[description] || description;
};



const GameDetailPage = () => {
  const { gameId } = useParams(); 
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  
  const [playTime, setPlayTime] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]); 
  const [interactionLoading, setInteractionLoading] = useState(false);
  const [interactionError, setInteractionError] = useState('');
  const [interactionSuccess, setInteractionSuccess] = useState('');

  
  const [currentUser, setCurrentUser] = useState(null);

  
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    const fetchGameDetails = async () => {
      setLoading(true);
      setPageError(null);
      try {
        const gameData = await getGameById(gameId);
        setGame(gameData);
        
        setComments(gameData.allComments || []); 
      } catch (error) {
        console.error('Error fetching game details:', error);
        const message = error.response?.data?.message || 'An error occurred while loading game details.';
        setPageError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [gameId]);

  

  const handleInteraction = async (actionType, data) => {
    console.log('Current User:', currentUser);
    console.log('Current Game:', game);

    if (!currentUser) {
      setInteractionError('You must be logged in to perform this action.');
      return;
    }
    if (!game || !game._id) { 
      setInteractionError('Game information could not be loaded or is invalid.');
      return;
    }

    setInteractionLoading(true);
    setInteractionError('');
    setInteractionSuccess('');

    const userId = currentUser._id;
    const backendGameId = game._id;

    try {
      let result;
      let successMessage = '';
      
      switch (actionType) {
        case 'play':
          if (!data.playTime || isNaN(parseFloat(data.playTime)) || parseFloat(data.playTime) <= 0) {
              setInteractionError('Please enter a valid play time.');
              setInteractionLoading(false);
              return;
          }
          result = await playGame(userId, backendGameId, { playTime: parseFloat(data.playTime) });
          successMessage = 'Play time saved successfully!';
          setPlayTime('');
          break;
        case 'rate':
          result = await rateGame(userId, backendGameId, { rating: data.rating });
          successMessage = 'Your rating has been saved!';
          break;
        case 'comment':
           if (!data.comment || data.comment.trim() === '') {
              setInteractionError('Comment cannot be empty.');
              setInteractionLoading(false);
              return;
           }
           const commentText = data.comment.trim();
          result = await commentOnGame(userId, backendGameId, { comment: commentText });
          successMessage = 'Your comment has been submitted!';
          setComment('');
          
          
          const updatedGameData = await getGameById(gameId);
          setGame(updatedGameData);
          setComments(updatedGameData.allComments || []);
          break;
        default:
          setInteractionLoading(false);
          return;
      }
      
      setInteractionSuccess(successMessage);
    } catch (error) {
      console.error(`Error during ${actionType} interaction:`, error);
      setInteractionError(error.response?.data?.message || 'An error occurred during the operation.');
    } finally {
      setInteractionLoading(false);
    }
  };

  

  if (loading) {
    return <Container className="mt-4 text-center"><h2>Loading...</h2></Container>;
  }

  if (pageError) {
    return <Container className="mt-4 text-center"><h2 className="text-danger">{pageError}</h2></Container>;
  }

  if (!game) {
    
    return <Container className="mt-4 text-center"><h2>Game Not Found</h2></Container>;
  }

  return (
    <Container className="mt-4">
      {/* Interaction Feedback Alerts */}
      {interactionError && <Alert variant="danger" onClose={() => setInteractionError('')} dismissible>{interactionError}</Alert>}
      {interactionSuccess && <Alert variant="success" onClose={() => setInteractionSuccess('')} dismissible>{interactionSuccess}</Alert>}
      
      <Row>
        {/* Game Details Column */}
        <Col md={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Img 
              variant="top" 
              src={game.image || 'https://via.placeholder.com/800x400?text=No+Image'} // Provide fallback image
              alt={game.name}
              style={{ height: '400px', objectFit: 'cover' }}
            />
            <Card.Body>
              <h1>{game.name}</h1>
              {/* Display other game details using game state */}
              <div className="d-flex align-items-center mb-3">
                 <Badge bg="primary" className="me-2">{game.genres?.join(', ') || 'N/A'}</Badge> {/* Handle missing genres */}
                 <div className="d-flex align-items-center me-3">
                  <FaStar className="text-warning me-1" />
                  <span>{game.rating?.toFixed(1) || 'N/A'}</span> {/* Handle missing rating */}
                 </div>
                 <div className="d-flex align-items-center me-3">
                   <FaDollarSign className="text-success me-1" />
                   <span>{game.price?.toFixed(2) || 'N/A'}</span> {/* Handle missing price */}
                 </div>
                 <div className="d-flex align-items-center">
                  <FaCalendarAlt className="text-info me-1" />
                  {/* Ensure releaseDate is valid before formatting */} 
                  <span>{game.releaseDate ? new Date(game.releaseDate).toLocaleDateString() : 'N/A'}</span>
                 </div>
              </div>
              <p className="lead">{translateDescription(game.description || 'No description available.')}</p>
              
              {/* Developer, Publisher, Platforms (optional chaining) */}
              <div className="mb-3">
                <strong>Developer:</strong> {game.developer || 'N/A'}<br />
                <strong>Publisher:</strong> {game.publisher || 'N/A'}<br />
                <strong>Platforms:</strong> {game.platforms?.join(', ') || 'N/A'}
              </div>

              {/* Features */}
              {game.features && game.features.length > 0 && (
                <div className="mb-4">
                  <h4>Features</h4>
                  <div className="d-flex flex-wrap gap-2">
                    {game.features.map((feature, index) => (
                      <Badge key={index} bg="secondary">{feature}</Badge>
                    ))}
                  </div>
                </div>
              )}

               {/* System Requirements (check existence) */} 
              {game.systemRequirements?.minimum && (
                <div className="mb-4">
                  <h4>System Requirements (Minimum)</h4>
                  <Card>
                    <Card.Body>
                      <ul className="list-unstyled">
                        <li><strong>OS:</strong> {game.systemRequirements.minimum.os || 'N/A'}</li>
                        <li><strong>Processor:</strong> {game.systemRequirements.minimum.processor || 'N/A'}</li>
                        <li><strong>Memory:</strong> {game.systemRequirements.minimum.memory || 'N/A'}</li>
                        <li><strong>Graphics:</strong> {game.systemRequirements.minimum.graphics || 'N/A'}</li>
                        <li><strong>Storage:</strong> {game.systemRequirements.minimum.storage || 'N/A'}</li>
                      </ul>
                    </Card.Body>
                  </Card>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Interaction Column */}
        <Col md={4}>
           {/* Play Card */}
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h4>Play</h4>
              <Form onSubmit={(e) => { e.preventDefault(); handleInteraction('play', { playTime }); }}>
                <Form.Group className="mb-3">
                  <Form.Label>Play Time (hours)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={playTime}
                    onChange={(e) => setPlayTime(e.target.value)}
                    required
                    disabled={interactionLoading}
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100" disabled={interactionLoading || !currentUser}>
                  {interactionLoading ? 'Saving...' : <><FaPlay className="me-2" /> Save Play Time</>}
                </Button>
                 {!currentUser && <small className="text-danger d-block mt-2">You need to log in to save play time.</small>}
              </Form>
            </Card.Body>
          </Card>

          {/* Rate Card */}
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h4>Rate</h4>
              <Form onSubmit={(e) => { e.preventDefault(); handleInteraction('rate', { rating }); }}>
                <Form.Group className="mb-3">
                  <Form.Label>Rating</Form.Label>
                  <div className="d-flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`fs-4 me-1 ${star <= rating ? 'text-warning' : 'text-secondary'}`}
                        style={{ cursor: interactionLoading || !currentUser ? 'default' : 'pointer' }}
                        onClick={() => !interactionLoading && currentUser && setRating(star)}
                      />
                    ))}
                  </div>
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100" disabled={interactionLoading || !currentUser}>
                  {interactionLoading ? 'Submitting...' : <><FaStar className="me-2" /> Submit Rating</>}
                </Button>
                 {!currentUser && <small className="text-danger d-block mt-2">You need to log in to rate.</small>}
              </Form>
            </Card.Body>
          </Card>

          {/* Comment Card */}
          <Card className="shadow-sm">
            <Card.Body>
              <h4>Comment</h4>
              <Form onSubmit={(e) => { e.preventDefault(); handleInteraction('comment', { comment }); }}>
                <Form.Group className="mb-3">
                  <Form.Label>Comment</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    disabled={interactionLoading}
                    placeholder='Write your comment here...'
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100" disabled={interactionLoading || !currentUser}>
                  {interactionLoading ? 'Submitting...' : <><FaComment className="me-2" /> Submit Comment</>}
                </Button>
                 {!currentUser && <small className="text-danger d-block mt-2">You need to log in to comment.</small>}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Comments Section - Updated to use dynamic comments state */}
      <Row className="mt-4">
        <Col>
          <h3>Comments</h3>
          {/* Render comments from state */}
          {comments.length > 0 ? comments.slice().reverse().map((c, index) => ( 
            <Card key={c._id || `comment-${index}`} className="mb-3 shadow-sm"> {/* Use _id if available from backend, otherwise index */}
              <Card.Body>
                 <div className="d-flex justify-content-between align-items-center mb-2">
                   <h5 className="mb-0">{c.username || 'User'}</h5> 
                   {/* Display rating if available in comment data - Adjust based on actual data */}
                   {/* {c.rating && ... } */}
                 </div>
                 <p className="mb-0">{c.comment || c.text}</p> 
                 <small className="text-muted">
                   {/* Display timestamp - Adjust formatting as needed */} 
                   {c.createdAt ? new Date(c.createdAt).toLocaleString() : 'Now'}
                 </small>
              </Card.Body>
            </Card>
          )) : (
            <p>No comments yet. Be the first to comment!</p>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default GameDetailPage; 