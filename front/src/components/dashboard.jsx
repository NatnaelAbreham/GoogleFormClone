import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import natiImage from '../images/nati.jpg'; // adjust path relative to this file



const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (path) => {
    navigate(path);
  };

  const getActiveNav = () => {
    return navItems.find(item => location.pathname === item.path)?.id || 'render';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-screen overflow-x-hidden">
    

   
      <main className="flex-grow w-full ">
        <Outlet />
      </main>

     
    </div>
  );
};

export default Dashboard;