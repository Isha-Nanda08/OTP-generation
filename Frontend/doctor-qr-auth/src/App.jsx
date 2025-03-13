import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import { DoctorProvider } from './context/DoctorContext';

function App() {
  return (
    <DoctorProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </DoctorProvider>
  );
}

export default App;
