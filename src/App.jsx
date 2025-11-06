import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from './components/dashboard';
import FormPage from './components/FormPage';
import ViewPage from './components/ViewPage';
import DeleteForm from './components/DeleteForm';
import PublishForm from './components/PublishForm';
import FormRenderer from './components/FormRenderer';
import GetResponse from './components/GetResponse';
import ViewResponses from './components/VewResponses';
import SmsSender from './components/SmsSender';

function App() {
  const [formData, setFormData] = useState(null);

  const handleFormUpdate = useCallback((data) => {
    setFormData(data);
  }, []); // Empty dependency array means this function is stable

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard/form" replace />} />

        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="form" element={<FormPage onFormUpdate={handleFormUpdate} />} />
          <Route path="view" element={<ViewPage formData={formData} />} />

          <Route path="delete" element={<DeleteForm />} />
          <Route path="publish" element={<PublishForm />} />
          <Route path="render" element={<FormRenderer />} />
          <Route path="response" element={<GetResponse />} />
          <Route path="viewresponses" element={<ViewResponses />} />
          <Route path="sms" element={<SmsSender />} />

          <Route index element={<Navigate to="form" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;