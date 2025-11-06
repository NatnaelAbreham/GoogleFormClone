import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from './components/dashboard';

import FormRenderer from './components/FormRenderer';
import SuccessPage from './components/SuccessPage';

function App() {
  const [formData, setFormData] = useState(null);

  const handleFormUpdate = useCallback((data) => {
    setFormData(data);
  }, []); // Empty dependency array means this function is stable

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard/render" replace />} />

        <Route path="/dashboard" element={<Dashboard />}>
          
          <Route path="render" element={<FormRenderer />} />
          <Route path="render/success" element={<SuccessPage />} />
          <Route path="success" element={<SuccessPage />} />

         
        </Route>
      </Routes>
    </Router>
  );
}

export default App;