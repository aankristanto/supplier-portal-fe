import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import Home from "./page/home/Home"
import LotBatch from "./page/lotBatch/LotBatch"
import Mpo from './page/mpo/Mpo'
import NotFound from './page/NotFound';
import LoginPage from './page/Login';
import MainLayout from './component/MainLayout';
import { injectNavigate } from './config/axios';
import { ToastContainer } from 'react-toastify';
import CompanyPage from './page/company/Company';
import UserPage from './page/user/User';

const AppLayout = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    injectNavigate(navigate);
  }, [navigate]);

  return (
    <>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/lot-batch" element={<LotBatch />} />
        <Route path="/mpo" element={<Mpo />} />
        <Route path="/company" element={<CompanyPage />} />
        <Route path="/user" element={<UserPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
     <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <AppLayout />
      </div>
    </Router>
  )
}



export default App;
