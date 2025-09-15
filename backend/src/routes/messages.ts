import express from 'express';
import { messageLimiter } from '../middleware/rateLimiting';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Messages endpoint - à implémenter' });
});

router.post('/', messageLimiter, (req, res) => {
  res.json({ message: 'Send message endpoint - à implémenter' });
});

export default router;
