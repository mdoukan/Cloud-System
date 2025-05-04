import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container>
        <Row>
          <Col md={4} className="mb-3 mb-md-0">
            <h5>Game Distribution</h5>
            <p className="text-muted">
              Your one-stop platform for discovering and sharing game experiences.
            </p>
          </Col>
          <Col md={4} className="mb-3 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-muted">Home</a></li>
              <li><a href="/games" className="text-muted">Games</a></li>
              <li><a href="/user/1" className="text-muted">Profile</a></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contact</h5>
            <ul className="list-unstyled text-muted">
              <li>Email: info@gamedistribution.com</li>
              <li>Phone: +1 234 567 890</li>
            </ul>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col className="text-center text-muted">
            <small>&copy; {new Date().getFullYear()} Game Distribution. All rights reserved.</small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 