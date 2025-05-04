import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaStar, FaCalendarAlt, FaDollarSign, FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getAllGames } from '../services/api';


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

const GamesPage = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllGames();
        setGames(data);
      } catch (err) {
        console.error('Error fetching games:', err);
        setError('An error occurred while loading games.');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const handleViewDetails = (gameId) => {
    navigate(`/games/${gameId}`);
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading games...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1 className="text-center mb-4">Game Library</h1>
      
      <Row xs={1} md={2} lg={3} className="g-4">
        {games.length > 0 ? games.map(game => (
          <Col key={game._id}>
            <Card className="h-100 shadow-sm">
              <Card.Img 
                variant="top" 
                src={game.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={game.name}
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title>{game.name || 'Unnamed Game'}</Card.Title>
                <Card.Text className="text-muted mb-2" style={{ flexGrow: 1, height: '60px', overflow: 'hidden' }}>
                  {translateDescription(game.description?.substring(0, 100) + (game.description?.length > 100 ? '...' : '') || 'No description.')}
                </Card.Text>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Badge bg="secondary">{game.genres?.join(', ') || 'N/A'}</Badge>
                  <div className="d-flex align-items-center">
                    <FaStar className="text-warning me-1" />
                    <span>{game.rating?.toFixed(1) || '-'}</span>
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center text-muted">
                    <FaClock className="me-1" />
                    <small>{game.playTime?.toFixed(1) || '0'} hrs</small>
                  </div>
                  <div className="d-flex align-items-center text-muted">
                    <FaCalendarAlt className="me-1" />
                    <small>{game.releaseDate ? new Date(game.releaseDate).toLocaleDateString() : '-'}</small>
                  </div>
                </div>
                <Button 
                  variant="primary" 
                  className="w-100 mt-auto"
                  onClick={() => handleViewDetails(game._id)}
                >
                  View Details
                </Button>
              </Card.Body>
            </Card>
          </Col>
        )) : (
          <Col>
            <p className="text-center">No games found.</p>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default GamesPage; 