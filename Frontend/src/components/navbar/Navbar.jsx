import React, { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Badge from "@mui/material/Badge";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Avatar from "@mui/material/Avatar";
import HomeIcon from "@mui/icons-material/Home";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import EditIcon from "@mui/icons-material/Edit";
import ReportIcon from "@mui/icons-material/Report";
import LogoutIcon from "@mui/icons-material/Logout";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import DashboardBar from '../dashboard/DashboardBar';
import CloseIcon from '@mui/icons-material/Close';

import Logo from "../../assets/images/Civix logo.jpg"; // Use your logo image

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  // Fetch logged-in user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/profile", {
          withCredentials: true,
        });
        setUser(res.data.user); // store user data
      } catch (err) {
        console.error("Error fetching profile:", err.response?.data?.message);
      }
    };
    fetchUser();
  }, []);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSearchClick = () => {
    setSearchOpen((prev) => !prev);
  };

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };
  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const navigate = useNavigate && typeof useNavigate === 'function' ? useNavigate() : null;
  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });
      setUser(null); // clear user after logout
      if (navigate) {
        navigate("/"); // redirect to Home.jsx route
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Logout failed:", err.response?.data?.message);
    }
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed" color="primary" sx={{ zIndex: 100 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: 64 }}>
        {/* Left: Logo, Civix, Beta */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar src={Logo} alt="Civix Logo" sx={{ width: 40, height: 40, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
            Civix
          </Typography>
          {!isMobile && (
            <Typography
              variant="caption"
              sx={{ bgcolor: 'yellow', color: 'black', px: 1, borderRadius: 1, ml: 1 }}
            >
              Beta
            </Typography>
          )}
        </Box>

        {/* Center: Navigation Links (hidden on mobile) */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <IconButton color="inherit" href="/">
              <HomeIcon />
              <Typography variant="body1" sx={{ ml: 0.5 }}>
                Home
              </Typography>
            </IconButton>
            <IconButton color="inherit" href="/petitions">
              <EditIcon />
              <Typography variant="body1" sx={{ ml: 0.5 }}>
                Petitions
              </Typography>
            </IconButton>
            <IconButton color="inherit" href="/polls">
              <HowToVoteIcon />
              <Typography variant="body1" sx={{ ml: 0.5 }}>
                Polls
              </Typography>
            </IconButton>
            <IconButton color="inherit" href="/reports">
              <ReportIcon />
              <Typography variant="body1" sx={{ ml: 0.5 }}>
                Reports
              </Typography>
            </IconButton>
          </Box>
        )}

        {/* Right: Responsive controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isMobile ? (
            <>
              {/* Search Icon (shows search box on click) */}
              <IconButton color="inherit" onClick={handleSearchClick}>
                <SearchIcon />
              </IconButton>
              {/* Hamburger Icon (shows DashboardBar in Drawer) */}
              <IconButton color="inherit" onClick={handleDrawerOpen}>
                <MenuIcon />
              </IconButton>
              {/* Logout Icon for mobile */}
              <IconButton color="inherit" onClick={handleLogout}>
                <LogoutIcon />
              </IconButton>
              {/* Search Box (shown when searchOpen) */}
              {searchOpen && (
                <Box sx={{ position: 'absolute', top: 64, right: 16, bgcolor: 'white', borderRadius: 2, boxShadow: 3, p: 1, zIndex: 200 }}>
                  <InputBase
                    autoFocus
                    placeholder="Search…"
                    sx={{ ml: 1, flex: 1, color: 'black', minWidth: 120 }}
                    inputProps={{ 'aria-label': 'search' }}
                  />
                </Box>
              )}
              {/* Drawer for DashboardBar */}
              <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerClose}>
                <Box sx={{ width: 250, p: 2, position: 'relative', height: '100%' }}>
                  <IconButton
                    onClick={handleDrawerClose}
                    sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}
                    aria-label="close"
                  >
                    <CloseIcon />
                  </IconButton>
                  <Box sx={{ mt: 5 }}>
                    <DashboardBar />
                  </Box>
                </Box>
              </Drawer>
            </>
          ) : (
            <>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: 'white',
                  borderRadius: 2,
                  px: 1,
                }}
              >
                <InputBase
                  placeholder="Search…"
                  sx={{ ml: 1, flex: 1, color: 'black', minWidth: 120 }}
                  inputProps={{ 'aria-label': 'search' }}
                />
                <IconButton type="submit" sx={{ p: '8px' }} aria-label="search">
                  <SearchIcon sx={{ color: 'primary.main' }} />
                </IconButton>
              </Box>
              <IconButton color="inherit">
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              {/* Avatar */}
              <Avatar
                alt={user?.name || 'User'}
                src="https://randomuser.me/api/portraits/men/75.jpg"
                sx={{ width: 36, height: 36, ml: 1, cursor: 'pointer' }}
                onClick={handleAvatarClick}
              />
              {/* Dropdown Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem disabled>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {user?.name || 'Guest'}
                  </Typography>
                </MenuItem>
                <MenuItem
                  onClick={handleLogout}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <LogoutIcon fontSize="small" />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Logout
                  </Typography>
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
