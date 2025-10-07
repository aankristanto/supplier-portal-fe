import React, { useState } from 'react';
import Sidebar from './Sidebar';
import '../styles/MainLayout.css';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  const [togel, setTogel] = useState(false); 

  const toggleSidebar = () => {
    setTogel(!togel); 
  };

  return (
    <div className={`layout-container ${togel ? 'sidebar-collapsed' : ''}`}>
      <Sidebar togel={togel} handleToggle={toggleSidebar} />
      <div className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;