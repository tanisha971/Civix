import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Avatar from '@mui/material/Avatar';
import HomeIcon from '@mui/icons-material/Home';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import EditIcon from '@mui/icons-material/Edit';
import ReportIcon from '@mui/icons-material/Report';
import Logo from '../../assets/images/govImg.jpeg'; // Use your logo image

export default function Navbar() {
	return (
		<AppBar position="fixed" color="primary" sx={{ zIndex: 100 }}>
			<Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: 64 }}>
				{/* Left: Logo, Civix, Beta */}
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Avatar src={Logo} alt="Civix Logo" sx={{ width: 40, height: 40, mr: 1 }} />
					<Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>Civix</Typography>
					<Typography variant="caption" sx={{ bgcolor: 'yellow', color: 'black', px: 1, borderRadius: 1, ml: 1 }}>Beta</Typography>
				</Box>
				{/* Center: Navigation Links */}
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
					<IconButton color="inherit" href="/">
						<HomeIcon />
						<Typography variant="body1" sx={{ ml: 0.5 }}>Home</Typography>
					</IconButton>
					<IconButton color="inherit" href="/petitions">
						<EditIcon />
						<Typography variant="body1" sx={{ ml: 0.5 }}>Petitions</Typography>
					</IconButton>
					<IconButton color="inherit" href="/polls">
						<HowToVoteIcon />
						<Typography variant="body1" sx={{ ml: 0.5 }}>Polls</Typography>
					</IconButton>
					<IconButton color="inherit" href="/reports">
						<ReportIcon />
						<Typography variant="body1" sx={{ ml: 0.5 }}>Reports</Typography>
					</IconButton>
				</Box>
				{/* Right: Search, Notification, Profile */}
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'white', borderRadius: 2, px: 1 }}>
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
					<Avatar alt="User" src="https://randomuser.me/api/portraits/men/75.jpg" sx={{ width: 36, height: 36, ml: 1 }} />
					<Typography variant="body1" sx={{ ml: 1, fontWeight: 500 }}>Tanisha</Typography>
				</Box>
			</Toolbar>
		</AppBar>
	);
}
