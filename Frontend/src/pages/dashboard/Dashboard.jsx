// Dashboard.jsx
import React from 'react';
import Navbar from '../../components/navbar/Navbar';
import Sidebar1 from '../../components/sidebar/Sidebar1';
import Welcome from '../../components/dashboard/Welcome';
import DashboardBar from '../../components/dashboard/DashboardBar';

import { Outlet } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div style={{ display: 'flex', marginTop: 64 }}>
        {/* Left Sidebar */}
        <div style={{ width: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', minHeight: 'calc(100vh - 64px)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Sidebar1 />
          <DashboardBar />
        </div>
        {/* Right Content */}
        <div style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column' }}>
          <Welcome />
          
          <div >
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}