import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import './home.css';

const Home = () => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const menuItems = [
    // { title: "Dashboards", icon: <FaChartLine />, color: "#0d6efd", path: "/dashboards" },
    
  ];

  return (
    <div>
      <header className="page-header d-flex justify-content-between align-items-center p-3 mb-4">
        <div>
          <h4 className="m-0">Vendor Portal (Supllier Management System)</h4>
          <small className="text-muted">{today}</small>
        </div>
      </header>

      <div className="logo-container text-center mb-4">
        <Card className="shadow-sm p-4 logo-card">
              <h1 className="gradient-text">PT Sumber Bintang Rejeki</h1>
              <p>Underware factory in indonesia</p>
        </Card>
      </div>

      <div className="menu-grid">
        <Row xs={2} md={3} lg={6} className="g-3">
          {menuItems.map((item, index) => (
            <Col key={index}>
              <Card
                className="menu-item shadow-sm h-100"
                style={{ borderColor: item.color }}
                onClick={() => console.log(`Navigate to ${item.title}`)}
              >
                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-3">
                  <div
                    className="icon-wrapper mb-2"
                    style={{
                      backgroundColor: `${item.color}20`,
                      color: item.color,
                      width: '60px',
                      height: '60px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                    }}
                  >
                    {item.icon}
                  </div>
                  <Card.Title className="text-center m-0" style={{ color: item.color }}>
                    {item.title}
                  </Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Home;