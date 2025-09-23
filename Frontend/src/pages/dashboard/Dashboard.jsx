// Dashboard.jsx
import React from 'react';
import Navbar from '../../components/navbar/Navbar';
import Sidebar1 from '../../components/sidebar/Sidebar1';
import Welcome from '../../components/dashboard/Welcome';
import DashboardBar from '../../components/dashboard/DashboardBar';
import { useEffect, useState } from "react";
import { getProfile } from "../../services/api";

import { Outlet } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  // Responsive: use window.matchMedia
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 600 : false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getProfile();
        setUser(data.user); // set user from backend
      } catch (err) {
        console.error("Failed to fetch profile, maybe not logged in");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(typeof window !== 'undefined' ? window.innerWidth <= 600 : false);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if current route is dashboard index (not petitions)
  const isDashboardIndex = location.pathname === '/dashboard' || location.pathname === '/dashboard/';

  if (!user) return <div>Loading...</div>; // show loading while fetching

  return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        {isMobile ? (
          <>
            {/* Sidebar1 full row */}
            <div style={{ width: '100%', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginTop: 64 }}>
              <Sidebar1 user={user} />
            </div>
            {/* Welcome full row */}
            {isDashboardIndex && (
            <div style={{ width: '100%', padding: '16px', marginTop: 8 }}>
              <Welcome user={user} />
            </div>
            )}
            {/* Outlet full row */}
            <div style={{ width: '100%', padding: '16px', marginTop: 8 }}>
              <Outlet />
            </div>
            {/* DashboardCard hidden on mobile (included in hamburger) */}
          </>
        ) : (
          <div style={{ display: 'flex', marginTop: 64 }}>
            {/* Left Sidebar */}
            <div style={{ width: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', minHeight: 'calc(100vh - 64px)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <Sidebar1 user={user} />
              <DashboardBar />
            </div>
            {/* Right Content */}
            <div style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column' }}>

              {/* Welcome message - Only show on dashboard index */}
            {isDashboardIndex && <Welcome user={user} />}
              <div>
                <Outlet />
              </div>
            </div>
          </div>
        )}
    </div>
  );
}