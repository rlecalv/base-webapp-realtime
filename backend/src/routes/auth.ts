import express from 'express';
import { authLimiter, registerLimiter } from '../middleware/rateLimiting';

const router = express.Router();

router.post('/login', authLimiter, (req, res) => {
  res.json({ message: 'Auth endpoint - à implémenter' });
});

router.post('/register', registerLimiter, (req, res) => {
  res.json({ message: 'Register endpoint - à implémenter' });
});

export default router;
