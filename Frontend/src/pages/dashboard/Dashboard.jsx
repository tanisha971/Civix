// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, isPublicOfficial } from '../../services/authService';
import Navbar from '../../components/navbar/Navbar';
import Sidebar1 from '../../components/sidebar/Sidebar1';
import Welcome from '../../components/dashboard/Welcome';
import DashboardBar from '../../components/dashboard/DashboardBar';
import { getProfile } from "../../services/api";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Responsive: check if mobile
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth <= 600 : false
  );

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getProfile();
        setUser(data.user);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        // If profile fetch fails, redirect to login
        navigate('/login');
      }
    };
    
    fetchUser();
  }, [navigate]);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(typeof window !== 'undefined' ? window.innerWidth <= 600 : false);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if current route is dashboard index
  const isDashboardIndex = location.pathname === '/dashboard' || location.pathname === '/dashboard/';

  // Show loading while fetching user data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If no user data, show error state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Unable to load user data</p>
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      {isMobile ? (
        // Mobile Layout
        <>
          {/* Mobile Sidebar - Full width */}
          <div style={{ 
            width: '100%', 
            background: '#fff', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
            marginTop: 64 
          }}>
            <Sidebar1 user={user} />
          </div>
          
          {/* Mobile Welcome - Only on dashboard index */}
          {isDashboardIndex && (
            <div style={{ 
              width: '100%', 
              padding: '16px', 
              marginTop: 8 
            }}>
              <Welcome user={user} />
            </div>
          )}
          
          {/* Mobile Content */}
          <div style={{ 
            width: '100%', 
            padding: '16px', 
            marginTop: 8 
          }}>
            <Outlet />
          </div>
        </>
      ) : (
        // Desktop Layout
        <div style={{ 
          display: 'flex', 
          marginTop: 64 
        }}>
          {/* Desktop Left Sidebar */}
          <div style={{ 
            width: 280, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            background: '#fff', 
            minHeight: 'calc(100vh - 64px)', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)' 
          }}>
            <Sidebar1 user={user} />
            <DashboardBar />
          </div>
          
          {/* Desktop Right Content */}
          <div style={{ 
            flex: 1, 
            padding: '32px', 
            display: 'flex', 
            flexDirection: 'column' 
          }}>
            {/* Desktop Welcome - Only on dashboard index */}
            {isDashboardIndex && <Welcome user={user} />}
            
            {/* Main Content Area */}
            <div>
              <Outlet />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}