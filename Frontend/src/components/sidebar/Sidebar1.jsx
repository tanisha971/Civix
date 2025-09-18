import React from 'react';
import Avatar from '@mui/material/Avatar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function Sidebar1({ user }) {
  const verified = true;
  return (
    <div style={{ width: '100%', padding: 24, textAlign: 'center' }}>
      <Avatar
        src={user?.avatar || "https://randomuser.me/api/portraits/men/75.jpg"}
        sx={{ width: 72, height: 72, margin: "0 auto" }}
      />
      <h2 style={{ margin: '16px 0 8px', fontWeight: 600 }}>{user?.name}</h2>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {verified ? (
          <CheckCircleIcon color="success" />
        ) : (
          <CancelIcon color="error" />
        )}
        <span style={{ fontWeight: 500 }}>{verified ? 'Verified' : 'Unverified'} Account</span>
      </div>
      <div style={{ marginTop: 12, color: '#555', fontSize: 14 }}>
        <LocationOnIcon fontSize="small" /> {user ? user.location : "Location"}
      </div>
      <div style={{ marginTop: 4, color: '#555', fontSize: 14 }}>
        <EmailIcon fontSize="small" /> {user ? user.email : "Email"}
      </div>
    </div>
  );
}
