import React, { useState } from 'react';

const Dashboard = () => {
 
  
 
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full overflow-x-hidden">
     
      <main className="flex-grow w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 capitalize">{activeNav} Page</h1>
            <p className="text-gray-600 mt-2">
              Welcome to the {activeNav.toLowerCase()} section. Manage your forms and settings here.
            </p>
          </div>      
          
        </div>
      </main>

 
    
    </div>
  );
};

export default Dashboard;
