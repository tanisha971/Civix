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
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import DashboardBar from '../dashboard/DashboardBar';
import CloseIcon from '@mui/icons-material/Close';
import { getProfile } from "../../services/api";
import { searchService } from "../../services/searchService";
import SearchResults from "../search/SearchResults";
import { CircularProgress } from "@mui/material";
import Divider from '@mui/material/Divider';
import Logo from "../../assets/images/Civix logo.jpg";

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');
  const navigate = useNavigate();

  //notification modal
  const [openNotif, setOpenNotif] = useState(false);
  const closeNotif = () => setOpenNotif(false);

  //dummy notifications
  const notifications = [
    { id: 1, title: 'Petition Approved', body: 'Your petition “Fix Streetlights” has been approved.', time: '2 min ago' },
    { id: 2, title: 'Poll Closed', body: 'Poll “Weekly Market Holiday” has ended.', time: '1 hour ago' },
    { id: 3, title: 'Official Update', body: 'Official response added to your poll.', time: '3 hours ago' },
    { id: 4, title: 'Budget Sanctioned', body: 'Community-centre budget sanctioned.', time: '5 hours ago' },
    { id: 5, title: 'Signature Milestone', body: 'Your petition reached 500 signatures.', time: 'Yesterday' },
    { id: 6, title: 'New Poll Published', body: 'Poll “Dog Park Location” is now live.', time: 'Yesterday' },
    { id: 7, title: 'Petition Rejected', body: 'Petition “Allow 24×7 Hawkers” was rejected.', time: '2 days ago' },
    { id: 8, title: 'Traffic Light Fixed', body: 'New traffic lights installed at 5th & Main.', time: '2 days ago' },
    { id: 9, title: 'Extra Trucks Sanctioned', body: 'Ward-12 gets more waste-collection trucks.', time: '3 days ago' },
    { id: 10, title: 'Parade Permit Granted', body: 'Independence-Day parade permit approved.', time: '4 days ago' },
    { id: 11, title: 'Pothole Crew Dispatched', body: 'Lake-Rd pothole repair completed.', time: '5 days ago' },
    { id: 12, title: 'LED Upgrade Phase-2', body: 'LED street-light upgrade phase-2 approved.', time: '6 days ago' },
    { id: 13, title: 'Night-Market Response', body: 'Official response added to night-market poll.', time: '1 week ago' },
    { id: 14, title: 'Signature Count Verified', body: '“Dog Park” petition signatures verified.', time: '1 week ago' },
    { id: 15, title: 'Car-Ban Petition Closed', body: 'Unsuccessful “Ban all cars” petition closed.', time: '1 week ago' },
  ];
 

  // Fetch logged-in user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getProfile();
        setUser(response.user);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchUser();
  }, []);

  // Search functionality
  const handleSearch = async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults(null);
      setShowResults(false);
      return;
    }
    setSearchLoading(true);
    try {
      const results = await searchService.searchAll(query.trim());
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ polls: [], petitions: [], reports: [], total: 0, error: error.message });
      setShowResults(true);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => handleSearch(searchQuery), 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearchInputChange = (e) => setSearchQuery(e.target.value);
  const handleSearchFocus = () => setShowResults(true);
  const handleSearchBlur  = () => setTimeout(() => setShowResults(false), 200);
  const handleCloseSearchResults = () => {
    setShowResults(false); setSearchQuery(''); setSearchResults(null);
  };

  const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
  const handleSearchClick = () => setSearchOpen((p) => !p);
  const handleDrawerOpen  = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);
  const handleMenuClose   = () => setAnchorEl(null);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("user");
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed" color="primary" sx={{ zIndex: 100 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: 64 }}>
        {/* Left: Logo, Civix, Beta */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar src={Logo} alt="Civix Logo" sx={{ width: 40, height: 40, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>Civix</Typography>
          {!isMobile && (
            <Typography variant="caption" sx={{ bgcolor: 'yellow', color: 'black', px: 1, borderRadius: 1, ml: 1 }}>Beta</Typography>
          )}
        </Box>

        {/* Center: Navigation Links (desktop) */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <IconButton color="inherit" onClick={() => navigate('/')}><HomeIcon /><Typography variant="body1" sx={{ ml: 0.5 }}>Home</Typography></IconButton>
            <IconButton color="inherit" onClick={() => navigate('/dashboard/petitions')}><EditIcon /><Typography variant="body1" sx={{ ml: 0.5 }}>Petitions</Typography></IconButton>
            <IconButton color="inherit" onClick={() => navigate('/dashboard/polls')}><HowToVoteIcon /><Typography variant="body1" sx={{ ml: 0.5 }}>Polls</Typography></IconButton>
            <IconButton color="inherit" onClick={() => navigate('/dashboard/reports')}><ReportIcon /><Typography variant="body1" sx={{ ml: 0.5 }}>Reports</Typography></IconButton>
          </Box>
        )}

        {/* Right: controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isMobile ? (
            <>
              <IconButton color="inherit" onClick={handleSearchClick}><SearchIcon /></IconButton>
              <IconButton color="inherit" onClick={handleDrawerOpen}><MenuIcon /></IconButton>
              <IconButton color="inherit" onClick={handleLogout}><LogoutIcon /></IconButton>
              {searchOpen && (
                <Box sx={{ position: 'absolute', top: 64, left: 16, right: 16, bgcolor: 'white', borderRadius: 2, boxShadow: 3, p: 1, zIndex: 200 }}>
                  <InputBase
                    autoFocus
                    placeholder="Search polls, petitions, reports..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    endAdornment={searchLoading ? <CircularProgress size={20} sx={{ color: 'primary.main', mr: 1 }} /> : null}
                    sx={{ ml: 1, flex: 1, color: 'black', width: '100%', pr: 4 }}
                  />
                  {showResults && <SearchResults results={searchResults} searchQuery={searchQuery} onClose={handleCloseSearchResults} onItemClick={() => setSearchOpen(false)} />}
                </Box>
              )}
              <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerClose}>
                <Box sx={{ width: 250, p: 2, position: 'relative', height: '100%' }}>
                  <IconButton onClick={handleDrawerClose} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}><CloseIcon /></IconButton>
                  <Box sx={{ mt: 5 }}><DashboardBar /></Box>
                </Box>
              </Drawer>
            </>
          ) : (
            <>
              {/* Desktop search */}
              <Box sx={{ position: 'relative' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'white', borderRadius: 2, px: 1, minWidth: 200 }}>
                  <InputBase placeholder="Search" value={searchQuery} onChange={handleSearchInputChange} onFocus={handleSearchFocus} onBlur={handleSearchBlur}
                    endAdornment={<IconButton type="submit" sx={{ p: '8px' }} aria-label="search">{searchLoading ? <CircularProgress size={20} sx={{ color: 'primary.main' }} /> : <SearchIcon sx={{ color: 'primary.main' }} />}</IconButton>}
                    sx={{ ml: 1, flex: 1, color: 'black' }}
                  />
                </Box>
                {showResults && <SearchResults results={searchResults} searchQuery={searchQuery} onClose={handleCloseSearchResults} />}
              </Box>

              {/* ---- bell + blurred scrollable modal ---- */}
              <IconButton color="inherit" onClick={() => setOpenNotif(true)}>
                <Badge badgeContent={notifications.length} color="error"><NotificationsIcon /></Badge>
              </IconButton>
              {openNotif && (
                <>
                  {/* blurred backdrop */}
                  <Box
                    sx={{
                      position: 'fixed',
                      inset: 0,
                      backgroundColor: 'rgba(0,0,0,0.45)',
                      backdropFilter: 'blur(4px)',
                      zIndex: 1300,
                    }}
                    onClick={closeNotif}
                  />
                  {/* modal card */}
                  <Box
                    sx={{
                      position: 'fixed',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%,-50%)',
                      width: { xs: '90vw', sm: 520 },
                      maxHeight: '80vh',
                      bgcolor: '#ffffff',
                      borderRadius: 3,
                      boxShadow: 24,
                      zIndex: 1301,
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                    }}
                  >
                    {/* header */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 3,
                        py: 2,
                        bgcolor: '#303f9f',
                        color: '#fff',
                      }}
                    >
                      <Typography variant="h6" fontWeight={600}>
                        Notifications
                      </Typography>
                      <IconButton onClick={closeNotif} sx={{ color: '#fff' }}>
                        <CloseIcon />
                      </IconButton>
                    </Box>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,.18)' }} />

                    {/* scrollable list */}
                    <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 1 }}>
                      {notifications.map((n) => (
                        <Box
                          key={n.id}
                          sx={{
                            mb: 1.5,
                            p: 1.5,
                            borderRadius: 2,
                            transition: 'background-color .2s',
                            '&:hover': { bgcolor: '#f5f5f5' },
                          }}
                        >
                          <Typography variant="body2" fontWeight={600} color="#303f9f">
                            {n.title}
                          </Typography>
                          <Typography variant="caption" color="#616161">
                            {n.body}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            mt={.5}
                          >
                            {n.time}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </>
              )}

              {/* profile */}
              <Box onClick={handleAvatarClick} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>
                <Avatar alt={user?.name || 'User'} src="https://randomuser.me/api/portraits/men/75.jpg  " sx={{ width: 36, height: 36, ml: 1 }} />
                <ArrowDropDownIcon sx={{ color: 'white', ml: 0.5, transform: Boolean(anchorEl) ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </Box>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} sx={{ '& .MuiPaper-root': { minWidth: 180, mt: 1 } }}>
                <MenuItem disabled><Typography variant="body1" sx={{ fontWeight: 700 }}>{user?.name || 'Guest'}</Typography></MenuItem>
                <MenuItem onClick={handleLogout} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><LogoutIcon fontSize="small" /><Typography variant="body1" sx={{ fontWeight: 500 }}>Logout</Typography></MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}