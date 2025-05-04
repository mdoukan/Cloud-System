import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Spinner, Alert, Image, ListGroup } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getUserById } from '../services/api';

// Final CSS refinements based on latest screenshot
const pageStyle = {
  backgroundColor: '#1b2838', // Steam dark blue-grey
  color: '#c6d4df',       // Main light text color
  minHeight: '100vh',
  paddingTop: '1.5rem',
  paddingBottom: '1.5rem',
};

const darkCardStyle = { // Renamed for clarity
  backgroundColor: '#314155', // Standard dark card background
  borderColor: '#2a3f5a',   // Desaturated border color
  color: '#c6d4df',       // Match page text color
  marginBottom: '1.5rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)', // Slightly softer shadow
};

const cardHeaderStyle = {
  backgroundColor: '#2a3f5a', // Header slightly darker than card body
  borderBottom: '1px solid #2a3f5a',
  color: '#ffffff',
  fontWeight: 'bold',
  padding: '0.75rem 1rem',
};

const listGroupItemStyle = {
  backgroundColor: '#314155', // Match dark card background
  borderColor: '#2a3f5a',   // Match dark card border
  color: '#c6d4df',
  padding: '0.75rem 1rem',
  borderTop: '1px solid #2a3f5a', // Ensure consistent top border
};

const mutedTextStyle = {
  color: '#8f98a0', // Muted text color
};

// Styles for dark table (ADDING DEFINITIONS)
const darkTableHeaderStyle = {
  color: '#ffffff', // White header text
  backgroundColor: '#2a3f5a', // Match card header background
  borderBottom: '2px solid #2a3f5a', 
  borderTop: 'none',
  padding: '0.6rem 0.75rem',
  fontWeight: '600',
  fontSize: '0.9em',
};

const darkTableCellStyle = {
  verticalAlign: 'middle',
  backgroundColor: '#314155', // Match dark card background
  borderColor: '#2a3f5a', // Match dark card border
  color: '#c6d4df',       // Light text color
  padding: '0.6rem 0.75rem',
  borderTop: '1px solid #2a3f5a',
};

const linkButtonStyle = {
  color: '#66c0f4', // Steam accent blue
  textDecoration: 'none',
  padding: 0,
  background: 'none',
  border: 'none',
  fontWeight: '500',
};

const avatarPlaceholderStyle = {
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  border: '3px solid #66c0f4',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#2a3f5a',
  marginBottom: '1rem',
  margin: '0 auto 1rem auto',
};

const levelBadgeStyle = {
  display: 'inline-block',
  border: '1px solid #66c0f4',
  borderRadius: '50%',
  padding: '2px 8px',
  fontSize: '0.9em',
  color: '#66c0f4',
  marginRight: '0.5em',
  minWidth: '28px',
  textAlign: 'center',
};

// Helper function to format date safely
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) { // Check if date is valid
    return '-'; // Return placeholder if invalid
  }
  return date.toLocaleDateString('tr-TR');
};

const UserPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userData = await getUserById(userId);
        if (userData.playedGames) {
          userData.playedGames.sort((a, b) => (b.userPlayTime || 0) - (a.userPlayTime || 0));
        }
        if (userData.comments) {
          userData.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        setUser(userData);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.response?.data?.message || 'An error occurred while loading user data.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    } else {
      setError('Invalid User ID.');
      setLoading(false);
    }
  }, [userId]);

  if (loading) {
    return (
      <Container style={pageStyle} className="mt-0 pt-4 text-center">
        <Spinner animation="border" variant="info"/>
        <p className="text-light mt-2">Loading user profile...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container style={pageStyle} className="mt-0 pt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container style={pageStyle} className="mt-0 pt-4">
        <Alert variant="warning">User not found.</Alert>
      </Container>
    );
  }

  const recentPlayedGames = user.playedGames?.slice(0, 2) || [];
  const recentComments = user.comments?.slice(0, 2) || [];

  return (
    <Container fluid style={pageStyle} className="mt-0 px-0">
      <Row className="g-4 mx-0">
        <Col md={4} lg={3}>
          <Card style={darkCardStyle}>
            <Card.Body className="text-center p-4">
              {user.playedGames && user.playedGames.length > 0 && user.playedGames[0].image ? (
                <Image
                  src={user.playedGames[0].image} 
                  alt={user.playedGames[0].name ? `${user.playedGames[0].name} cover` : "Most played game cover"}
                  roundedCircle
                  className="mb-3"
                  width={120}
                  height={120}
                  style={{ border: '3px solid #66c0f4', objectFit: 'cover', margin: '0 auto' }}
                />
              ) : (
                <div style={avatarPlaceholderStyle}>
                   <span style={{ fontSize: '3em', color: '#8f98a0' }}>?</span> 
                </div>
              )}
              
              <h4 className="text-white mb-3">{user.name}</h4>
              <div className="mb-3">
                <span style={levelBadgeStyle}>15</span>
                <span style={mutedTextStyle}>Level</span>
              </div>
              <Button variant="secondary" size="sm" style={{ backgroundColor: '#5c6b7c', borderColor: '#5c6b7c' }}>Edit Profile</Button>
            </Card.Body>
          </Card>

          <Card style={darkCardStyle}>
            <Card.Header style={cardHeaderStyle}>Statistics</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item style={{...listGroupItemStyle, borderTop: 'none'}} className="d-flex justify-content-between"> 
                <span style={mutedTextStyle}>Avg. Rating:</span> <span>{user.averageRating || 'N/A'}</span>
              </ListGroup.Item>
              <ListGroup.Item style={listGroupItemStyle} className="d-flex justify-content-between">
                <span style={mutedTextStyle}>Total Play Time:</span> <span>{user.totalPlayTime?.toFixed(1) || 0} hrs</span>
              </ListGroup.Item>
              <ListGroup.Item style={listGroupItemStyle} className="d-flex justify-content-between">
                <span style={mutedTextStyle}>Most Played:</span> <span>{user.mostPlayedGame || 'None'}</span>
              </ListGroup.Item>
              <ListGroup.Item style={listGroupItemStyle} className="d-flex justify-content-between">
                <span style={mutedTextStyle}>Games Played:</span> <span>{user.playedGames?.length || 0}</span>
              </ListGroup.Item>
            </ListGroup>
          </Card>

          {(recentPlayedGames.length > 0 || recentComments.length > 0) && (
            <Card style={darkCardStyle}>
              <Card.Header style={cardHeaderStyle}>Recent Activities</Card.Header>
               <ListGroup variant="flush">
                 {recentPlayedGames.map((game, index) => (
                   <ListGroup.Item key={game._id} style={{...listGroupItemStyle, borderTop: index === 0 ? 'none' : listGroupItemStyle.borderTop }} className="d-flex align-items-center">
                    <Image src={game.image || 'https://via.placeholder.com/40x30?text=N/A'} width={40} height={30} className="me-3 flex-shrink-0" />
                    <div className="flex-grow-1">
                      <small className="d-block text-white">{game.name}</small>
                      <small style={mutedTextStyle}>{game.userPlayTime?.toFixed(1)} hrs played</small>
                    </div>
                  </ListGroup.Item>
                ))}
                {recentComments.map((comment, index) => (
                   <ListGroup.Item key={`comment-${index}`} style={{...listGroupItemStyle, borderTop: recentPlayedGames.length === 0 && index === 0 ? 'none' : listGroupItemStyle.borderTop }} > 
                    <small style={mutedTextStyle}>Commented on:</small>
                    <Button style={linkButtonStyle} className="ms-1" onClick={() => navigate(`/games/${comment.gameId}`)}>{comment.gameName}</Button>
                    <p className="mb-0 mt-1 fst-italic" style={mutedTextStyle}>"{comment.comment.substring(0, 50)}{comment.comment.length > 50 ? '...' : ''}"</p>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          )}
        </Col>

        <Col md={8} lg={9}>
          <Card style={darkCardStyle}> 
             <Card.Header style={cardHeaderStyle}>Games Played ({user.playedGames?.length || 0})</Card.Header>
             <Card.Body style={{ padding: 0 }}>
               {user.playedGames && user.playedGames.length > 0 ? (
                 <Table responsive hover size="sm" style={{ marginBottom: 0, backgroundColor: darkCardStyle.backgroundColor }}>
                   <thead>
                     <tr>
                       <th style={darkTableHeaderStyle}>Game</th>
                       <th style={darkTableHeaderStyle}>Play Time</th>
                       <th style={darkTableHeaderStyle}>Rating</th>
                       <th style={darkTableHeaderStyle}>Details</th>
                     </tr>
                   </thead>
                   <tbody> 
                     {user.playedGames.map((game, index) => (
                       <tr key={game._id}>
                         <td style={{ ...darkTableCellStyle, borderTop: index === 0 ? 'none' : darkTableCellStyle.borderTop }}> 
                           <Image src={game.image || 'https://via.placeholder.com/30x20?text=N/A'} rounded width={30} height={20} className="me-2" />
                           {game.name}
                         </td>
                         <td style={{ ...darkTableCellStyle, borderTop: index === 0 ? 'none' : darkTableCellStyle.borderTop }}>{game.userPlayTime?.toFixed(1) || 0} hrs</td>
                         <td style={{ ...darkTableCellStyle, borderTop: index === 0 ? 'none' : darkTableCellStyle.borderTop }}>{game.userRating || '-'}</td>
                         <td style={{ ...darkTableCellStyle, borderTop: index === 0 ? 'none' : darkTableCellStyle.borderTop }}>
                           <Button
                             variant="outline-info" // Back to outline-info for dark bg
                             size="sm"
                             style={{ color: '#66c0f4', borderColor: '#66c0f4' }} // Explicit color
                             onClick={() => navigate(`/games/${game._id}`)}
                           >
                             Go
                           </Button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </Table>
               ) : (
                 // Fallback message with dark background
                 <div style={{ padding: '1rem', backgroundColor: darkCardStyle.backgroundColor, color: darkCardStyle.color }}> 
                   No games played or rated yet.
                 </div>
               )}
             </Card.Body>
          </Card>

           <Card style={darkCardStyle}> {/* Comments card remains dark */}
            <Card.Header style={cardHeaderStyle}>Comments Made ({user.comments?.length || 0})</Card.Header>
            <Card.Body style={{ padding: 0 }}>
              {user.comments && user.comments.length > 0 ? (
                <ListGroup variant="flush">
                   {user.comments.map((comment, index) => (
                     <ListGroup.Item key={index} style={{...listGroupItemStyle, borderTop: index === 0 ? 'none' : listGroupItemStyle.borderTop }} className="py-3"> {/* Remove top border for first item */} 
                      <div className="d-flex align-items-center mb-2">
                        <Image
                          src={comment.gameImage || 'https://via.placeholder.com/40x30?text=N/A'}
                          rounded
                          width={40}
                          height={30}
                          className="me-3 flex-shrink-0"
                        />
                        <div className="flex-grow-1">
                          <Button style={linkButtonStyle} onClick={() => navigate(`/games/${comment.gameId}`)}>
                            {comment.gameName}
                          </Button>
                        </div>
                        <small style={mutedTextStyle}>{formatDate(comment.createdAt)}</small>
                      </div>
                      <p className="mb-0 ms-1" style={{ color: '#dfe3e6' }}>{comment.comment}</p>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="m-3">No comments made yet.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserPage; 