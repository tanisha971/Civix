import express from 'express';
import { auth } from '../middleware/auth.js';
import * as settingsController from '../controllers/settingsController.js';

const router = express.Router();

// Get user settings
router.get('/', auth, settingsController.getUserSettings);

// Update profile
router.put('/profile', auth, settingsController.updateProfile);

// Change password
router.put('/password', auth, settingsController.changePassword);

// Upload profile picture
router.post('/avatar', auth, settingsController.upload.single('avatar'), settingsController.uploadProfilePicture);

// Delete profile picture
router.delete('/avatar', auth, settingsController.deleteProfilePicture);

export default router;