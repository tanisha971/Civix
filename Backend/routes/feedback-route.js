import express from 'express';
import { auth } from '../middleware/auth.js';
import * as feedbackController from '../controllers/feedbackController.js';

const router = express.Router();

// Public routes (require authentication)
router.post('/', auth, feedbackController.submitFeedback);
router.get('/my-feedback', auth, feedbackController.getUserFeedback);
router.delete('/:feedbackId', auth, feedbackController.deleteFeedback);

// Admin routes (you'll need to add admin middleware)
router.get('/all', auth, feedbackController.getAllFeedback);
router.post('/:feedbackId/respond', auth, feedbackController.respondToFeedback);
router.put('/:feedbackId/status', auth, feedbackController.updateFeedbackStatus);

export default router;