import React, { useState, useEffect } from 'react';
import { IoIosLogOut } from 'react-icons/io';
import { CgProfile } from "react-icons/cg";
import SideMenu from './sidebar/SideMenu';
import Swal from "sweetalert2";
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, Modal, Col, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from '../config/axios.js';

const Sidebar = ({ togel, handleToggle }) => {
  const navigate = useNavigate();
    const location = useLocation();


  const [activeTab, setActiveTab] = useState('account');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [listMenu, setListMenu] = useState([])
  const [formData, setFormData] = useState({
    ID: '',
    INITIAL: '',
    NAME: '',
    EMAIL: '',
    NO_TELEPHONE: '',
    COMPANY_ID: '',
    ADDRESS: '',
    POSITION: '',
    LEVEL: '',
    SUMMARY: '',
    USER_PATH: '',
    GENDER: '',
  });


  const [passwordData, setPasswordData] = useState({
    ID: '',
    CURRENT_PASSWORD: '',
    NEW_PASSWORD: '',
    CONFIRM_PASSWORD: '',
  });
  const fetchProfile = async () => {
    try {
      const { data } = await axios.get('/auth/profile');
      setFormData(data.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch profile');
    }
  };

  const handleOpenProfile = () => {
    setShowProfileModal(true);
    setActiveTab('account');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitAccount = async (e) => {
    e.preventDefault();

    try {
      await axios.put('/auth/profile', formData);

      toast.success('Profile updated successfully!');
      setShowProfileModal(false);

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();

    if (passwordData.NEW_PASSWORD !== passwordData.CONFIRM_PASSWORD) {
      toast.warn("New password and confirm password do not match.");
      return;
    }


    const dataToSend = {
      ...passwordData,
      ID: formData.ID,
    };

    try {
      await axios.put('/auth/password', dataToSend);

      toast.success('Password updated successfully!');
      setPasswordData({ ID: '', CURRENT_PASSWORD: '', NEW_PASSWORD: '', CONFIRM_PASSWORD: '' });
      setShowProfileModal(false);

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    }
  };

  const fetchMenu = async () => {
    try {
      const {data} = await axios.get("/menu")
      setListMenu(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed fetch menu');
    }
  }

  const handleLogout = async () => {
    const resp = await Swal.fire({
      title: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      reverseButtons: true,
    });

    if (resp.isConfirmed) {
      localStorage.removeItem('token');
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchMenu()
  }, [])

  useEffect(() => {
    if (showProfileModal && activeTab === 'account') {
      fetchProfile();
    }
  }, [showProfileModal, activeTab]);

  return (
    <nav className={`sidebar ${togel ? 'closed' : ''} shadow-sm`}>
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Account Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className='body-account'>
          <Row>
            <Col md={3} className="border-end">
              <div className="list-group">
                <button
                  className={`list-group-item list-group-item-action ${activeTab === 'account' ? 'active' : ''}`}
                  onClick={() => setActiveTab('account')}
                >
                  Account Details
                </button>
                <button
                  className={`list-group-item list-group-item-action ${activeTab === 'password' ? 'active' : ''}`}
                  onClick={() => setActiveTab('password')}
                >
                  Change Password
                </button>
              </div>
            </Col>

            <Col md={9}>
              {activeTab === 'account' ? (
                <Form onSubmit={handleSubmitAccount}>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3" controlId="initial">
                        <Form.Label>Initial *</Form.Label>
                        <Form.Control
                          type="text"
                          name="INITIAL"
                          value={formData.INITIAL}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={8}>
                      <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Full Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="NAME"
                          value={formData.NAME}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Email *</Form.Label>
                        <Form.Control
                          type="email"
                          name="EMAIL"
                          value={formData.EMAIL}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group className="mb-3" controlId="gender">
                        <Form.Label>Title *</Form.Label>
                        <Form.Select
                          name="GENDER"
                          value={formData.GENDER}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="Tuan">Tuan</option>
                          <option value="Nyonya">Nyonya</option>
                          <option value="Nona">Nona</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="noTelephone">
                        <Form.Label>Phone Number *</Form.Label>
                        <Form.Control
                          type="text"
                          name="NO_TELEPHONE"
                          value={formData.NO_TELEPHONE}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>

                      <Form.Group className="mb-3" controlId="position">
                        <Form.Label>Position (Optional)</Form.Label>
                        <Form.Control
                          type="text"
                          name="POSITION"
                          value={formData.POSITION}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group className="mb-3" controlId="address">
                        <Form.Label>Address (Optional)</Form.Label>
                        <Form.Control
                          type="text"
                          name="ADDRESS"
                          value={formData.ADDRESS}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>

                  </Row>

                  <div className="d-flex justify-content-end mt-4">
                    <Button variant="primary" type="submit">
                      Update Profile
                    </Button>
                  </div>
                </Form>
              ) : (
                <Form onSubmit={handleSubmitPassword}>
                  <Form.Group className="mb-3" controlId="currentPassword">
                    <Form.Label>Current Password *</Form.Label>
                    <Form.Control
                      type="password"
                      name="CURRENT_PASSWORD"
                      value={passwordData.CURRENT_PASSWORD}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="newPassword">
                    <Form.Label>New Password *</Form.Label>
                    <Form.Control
                      type="password"
                      name="NEW_PASSWORD"
                      value={passwordData.NEW_PASSWORD}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="confirmPassword">
                    <Form.Label>Confirm New Password *</Form.Label>
                    <Form.Control
                      type="password"
                      name="CONFIRM_PASSWORD"
                      value={passwordData.CONFIRM_PASSWORD}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-end mt-4">
                    <Button variant="primary" type="submit">
                      Update Password
                    </Button>
                  </div>
                </Form>
              )}
            </Col>
          </Row>
        </Modal.Body>
      </Modal>

      <div className="image-text" onClick={() => navigate("/")}>
        <span className="image">Vendor Portal</span>
      </div>

      <div className={`toggle-button ${togel ? 'collapsed' : ''}`} onClick={handleToggle}>
        <div className="toggle-circle">
          {!togel ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6L15 12L9 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>

      <div className="menu-bar">
        <div className="menu">
          <ul className="menu-links" style={{ paddingLeft: 0 }}>
            {listMenu.map((menu, idx) => (
              <SideMenu
                key={idx}
                title={`${menu.TITLE}`}
                link={menu.PATH}
                icon={menu.ICON}
                isActive={location.pathname === menu.PATH}
              />
            ))}
          </ul>
        </div>

        <div className="bottom-content">
          <li>
            <div className="a" onClick={handleOpenProfile}>
              <CgProfile className="icon" />
              {!togel && <span className="text nav-text">Profile</span>}
            </div>
          </li>
          <li>
            <div className="a" onClick={handleLogout}>
              <IoIosLogOut className="icon" />
              {!togel && <span className="text nav-text">Logout</span>}
            </div>
          </li>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;