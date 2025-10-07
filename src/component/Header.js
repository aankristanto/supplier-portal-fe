import React from 'react';
import { Container, Navbar, Button } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import '../styles/Header.css';

const Header = ({ onToggleSidebar }) => {
  return (
    <Navbar bg="white" variant="light" className="header px-4 py-3 shadow-sm">
      <Container fluid>
        <Button variant="outline-secondary" size="sm" onClick={onToggleSidebar} className="me-3">
          <FaArrowLeft />
        </Button>
        
        <h4 className="m-0">
          SUMMIT (Sumbiri Management IT System)
        </h4>

        <div className="ms-auto d-flex align-items-center gap-3">
          <div className="date-info">
            Tuesday, October 7, 2025
          </div>
          <Button variant="secondary" size="sm" className="btn-banner">
            🎯 Banner
          </Button>
          <Button variant="outline-secondary" size="sm" className="btn-menu">
            📋 Menu
          </Button>
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;