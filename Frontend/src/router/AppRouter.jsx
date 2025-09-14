import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard
  from '../pages/dashboard/Dashboard'; 
import Home from '../pages/Home';
import DashboardCard from '../components/dashboard/DashboardCard';

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardCard />} />
          <Route path="petitions" element={<div>Petitions Page</div>} />
          <Route path="polls" element={<div>Polls Page</div>} />
          <Route path="officials" element={<div>Officials Page</div>} />
          <Route path="reports" element={<div>Reports Page</div>} />
          <Route path="settings" element={<div>Settings Page</div>} />
          <Route path="help" element={<div>Help & Support Page</div>} />
        </Route>
        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}