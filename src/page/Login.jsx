import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Image, Spinner } from 'react-bootstrap';
import '../styles/Login.css'; 
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios.js';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {data} = await axios.post('/auth/login', {
        EMAIL: formData.email,
        PASSWORD: formData.password,
      });

      setLoading(false);
      localStorage.setItem('token', data.data.accessToken);
      navigate('/');
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || "Hello");
    }
  };

  return (
    <Container fluid className="login-container">
      <Row className="h-100">
        <Col md={6} className="left-panel d-flex flex-column justify-content-center align-items-center p-5">
          <div className="brand-logo mb-4">
            <span className="logo-circle">●</span>
            <span className="logo-text">Vendor Portal</span>
          </div>
          <h1 className="tagline mb-4">
            Supllier Dashboard <br />
            <span className="highlight">Material Delivery</span>
          </h1>
          <Image src="/assets/images/login-ilustration.png" alt="Team Illustration" fluid />
        </Col>

        <Col md={6} className="right-panel d-flex flex-column justify-content-center align-items-center p-5">
          <Card className="login-card shadow-sm">
            <Card.Body>
              <h2 className="text-center mb-3">Vendor Portal</h2>
              <p className="text-center text-muted mb-4">Supplier Dashboard Material Delivery <br /> PT Sumber Bintang Rejeki</p>

              <Form onSubmit={onLogin}>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter email" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter password" />
                </Form.Group>

                  <Button variant="primary" type="submit" className="w-100 mb-3" disabled={loading}>
                  {loading ? <Spinner /> : 'Login'}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <footer className="mt-4 text-center text-muted small">
            ©{new Date().getFullYear()} Copyright - PT Sumber Bintang Rejeki
          </footer>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;