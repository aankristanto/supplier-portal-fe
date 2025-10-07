import React, { useState } from 'react';
import { IoIosLogOut } from 'react-icons/io';
import { CgProfile } from "react-icons/cg";
import SideMenu from './sidebar/SideMenu';
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';
import { Form, Button, Modal, Col, Row } from 'react-bootstrap';

const Sidebar = ({ togel, handleToggle }) => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('account');
  const [activeMenu, setActiveMenu] = useState('/');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    day: '',
    month: '',
    year: '',
    gender: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });



  const dummyMenus = [
    { id: 1, title: "Main Menu", path: "/", icon: "home" },
    { id: 2, title: "MPO", path: "/mpo", icon: "clipboard" },
    { id: 3, title: "Lot Batch", path: "/lot-batch", icon: "calendar" },
  ];



  const handleOpenProfile = () => {
    setShowProfileModal(true);
    setActiveTab('account'); // Reset ke tab account saat dibuka
  };



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitAccount = (e) => {
    e.preventDefault();
    alert("Profile updated successfully!");
  };

  const handleSubmitPassword = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }
    alert("Password updated successfully!");
    // Reset form
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

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
      navigate("/login");
    }
  }

  return (
    <nav className={`sidebar ${togel ? 'closed' : ''} shadow-sm`}>
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Account Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={4} className="border-end">
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

            <Col md={8}>
              {activeTab === 'account' ? (
                // Form Account Details
                <Form onSubmit={handleSubmitAccount}>
                  <Form.Group className="mb-3" controlId="firstName">
                    <Form.Label>First Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="lastName">
                    <Form.Label>Last Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label>E-Mail *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="dob">
                    <Form.Label>Date of Birth (Optional)</Form.Label>
                    <Row>
                      <Col>
                        <Form.Select
                          name="day"
                          value={formData.day}
                          onChange={handleChange}
                        >
                          <option value="">Day</option>
                          {[...Array(31)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col>
                        <Form.Select
                          name="month"
                          value={formData.month}
                          onChange={handleChange}
                        >
                          <option value="">Month</option>
                          {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(month => (
                            <option key={month} value={month}>{month}</option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col>
                        <Form.Select
                          name="year"
                          value={formData.year}
                          onChange={handleChange}
                        >
                          <option value="">Year</option>
                          {[...Array(50)].map((_, i) => {
                            const year = new Date().getFullYear() - 10 - i;
                            return <option key={year} value={year}>{year}</option>;
                          })}
                        </Form.Select>
                      </Col>
                    </Row>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="gender">
                    <Form.Label>Gender (Optional)</Form.Label>
                    <Form.Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>

                  <div className="d-flex justify-content-end mt-4">
                    <Button variant="primary" type="submit">
                      Update
                    </Button>
                  </div>
                </Form>
              ) : (
                // Form Change Password
                <Form onSubmit={handleSubmitPassword}>
                  <Form.Group className="mb-3" controlId="currentPassword">
                    <Form.Label>Current Password *</Form.Label>
                    <Form.Control
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="newPassword">
                    <Form.Label>New Password *</Form.Label>
                    <Form.Control
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="confirmPassword">
                    <Form.Label>Confirm New Password *</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
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
          {togel ? (
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
            {dummyMenus.map((menu) => (
              <SideMenu
                key={menu.id}
                title={menu.title}
                link={menu.path}
                icon={menu.icon}
                isActive={activeMenu === menu.path}
                onClick={() => setActiveMenu(menu.path)}
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