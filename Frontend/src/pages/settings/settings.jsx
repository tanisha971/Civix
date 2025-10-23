import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  Avatar,
  IconButton,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import settingsService from '../../services/settingsService';
import { formatUserAddress, getUserAvatar } from '../../utils/formatters';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ padding: '24px 0' }}>
      {value === index && children}
    </div>
  );
}

export default function Settings() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    location: '',
    avatar: null,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Load user settings on mount
  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getUserSettings();
      
      if (response.success) {
        const { user } = response;
        setProfileData({
          name: user.name || '',
          email: user.email || '',
          location: user.location || '',
          avatar: user.avatar || null,
        });
      }
    } catch (error) {
      console.error('Load settings error:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load settings'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setMessage({ type: '', text: '' });
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await settingsService.updateProfile({
        name: profileData.name,
        email: profileData.email,
        location: profileData.location,
      });

      if (response.success) {
        setMessage({
          type: 'success',
          text: 'Profile updated successfully!'
        });
        
        // Update local storage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          ...response.user
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('profileUpdated', { 
          detail: updatedUser 
        }));
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'New passwords do not match'
      });
      setUpdating(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 6 characters long'
      });
      setUpdating(false);
      return;
    }

    try {
      const response = await settingsService.changePassword(passwordData);

      if (response.success) {
        setMessage({
          type: 'success',
          text: 'Password changed successfully!'
        });
        
        // Clear password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Change password error:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to change password'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
      setMessage({
        type: 'error',
        text: 'Please select a valid image file (JPEG, PNG, or GIF)'
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: 'File size must be less than 5MB'
      });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await settingsService.uploadAvatar(file);

      if (response.success) {
        setProfileData({
          ...profileData,
          avatar: response.avatar, // This is now base64 string
        });
        setMessage({
          type: 'success',
          text: 'Profile picture updated successfully!'
        });

        // Update local storage with base64 image
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          avatar: response.avatar
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('profileUpdated', { 
          detail: updatedUser 
        }));
      }
    } catch (error) {
      console.error('Upload avatar error:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to upload profile picture'
      });
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await settingsService.deleteAvatar();

      if (response.success) {
        setProfileData({
          ...profileData,
          avatar: null,
        });
        setMessage({
          type: 'success',
          text: 'Profile picture deleted successfully!'
        });

        // Update local storage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          avatar: null
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('profileUpdated', { 
          detail: updatedUser 
        }));
      }
    } catch (error) {
      console.error('Delete avatar error:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete profile picture'
      });
    } finally {
      setUploading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    });
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            Settings
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
            Manage your account settings and preferences
          </Typography>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab icon={<PersonIcon />} label="Profile" />
          <Tab icon={<LockIcon />} label="Security" />
        </Tabs>

        {/* Messages */}
        {message.text && (
          <Box sx={{ p: 2 }}>
            <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })}>
              {message.text}
            </Alert>
          </Box>
        )}

        {/* Profile Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: 3 }}>
            {/* Avatar Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={profileData.avatar || undefined} // Use base64 string directly
                  sx={{ width: 120, height: 120, mb: 2, cursor: 'pointer' }}
                  onClick={handleAvatarClick}
                >
                  {!profileData.avatar && profileData.name?.charAt(0).toUpperCase()}
                </Avatar>
                {uploading && (
                  <CircularProgress
                    size={120}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }}
                  />
                )}
              </Box>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<PhotoCameraIcon />}
                  onClick={handleAvatarClick}
                  disabled={uploading}
                >
                  Change Photo
                </Button>
                {profileData.avatar && (
                  <IconButton
                    color="error"
                    onClick={handleDeleteAvatar}
                    disabled={uploading}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Max file size: 5MB (JPEG, PNG, GIF)
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Profile Form */}
            <form onSubmit={handleUpdateProfile}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleProfileChange}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Location"
                name="location"
                value={profileData.location}
                onChange={handleProfileChange}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                startIcon={<SaveIcon />}
                disabled={updating}
                sx={{ mt: 2 }}
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Box>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your current password to set a new one
            </Typography>

            <form onSubmit={handleChangePassword}>
              <TextField
                fullWidth
                label="Current Password"
                name="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('current')}
                        edge="end"
                      >
                        {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                sx={{ mb: 3 }}
                helperText="Password must be at least 6 characters and contain no spaces"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('new')}
                        edge="end"
                      >
                        {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('confirm')}
                        edge="end"
                      >
                        {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                startIcon={<LockIcon />}
                disabled={updating}
                sx={{ mt: 2 }}
              >
                {updating ? 'Changing Password...' : 'Change Password'}
              </Button>
            </form>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
}