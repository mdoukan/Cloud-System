import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import './App.css';


import Footer from './components/Footer';


import HomePage from './pages/HomePage';
import UserPage from './pages/UserPage';
import GamesPage from './pages/GamesPage';
import GameDetailPage from './pages/GameDetailPage';


import { getUserById } from './services/api';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  
  useEffect(() => {
    const checkUser = () => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing user from localStorage", e);
                localStorage.removeItem('currentUser'); 
                setCurrentUser(null);
            }
        } else {
            setCurrentUser(null);
        }
    };

    checkUser();

    
    window.addEventListener('storage', checkUser);

    
    const handleAuthChange = () => checkUser();
    window.addEventListener('authChange', handleAuthChange);

    
    return () => {
        window.removeEventListener('storage', checkUser);
        window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
      
      window.dispatchEvent(new Event('authChange')); 
  };

  return (
    <Router>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">Game Distribution Service</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/games">Games</Nav.Link>
              {currentUser && currentUser._id && (
                <Nav.Link as={Link} to={`/user/${currentUser._id}`}>My Profile</Nav.Link>
              )}
            </Nav>
            <Nav>
              {currentUser ? (
                 <Navbar.Text className="text-light me-3">
                   Welcome, {currentUser.name}
                 </Navbar.Text>
              ) : (
                 <Nav.Link as={Link} to="/">Login / Register</Nav.Link>
              )}
              {currentUser ? (
                <Button variant="outline-light" size="sm" onClick={handleLogout}>Logout</Button>
              ) : null}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4 flex-grow-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/user/:userId" element={<UserPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/:gameId" element={<GameDetailPage />} />
        </Routes>
      </Container>
      <Footer />
    </Router>
  );
}

export default App; 