import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from "./page/home/Home"
import LotBatch from "./page/lotBatch/LotBatch"
import Mpo from './page/mpo/Mpo'
import NotFound from './page/NotFound';
import LoginPage from './page/Login';
import MainLayout from './component/MainLayout';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
           <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/lot-batch" element={<LotBatch />} />
            <Route path="/mpo" element={<Mpo />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
