import express from 'express';
import { loginService } from '../services/login.service.js';

const router = express.Router();

// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await loginService(email, password);
    return res.json(result);
  } catch (error) {
    console.error('Error during login:', error);
    // Use 403 for unverified users, 401 for invalid credentials
    const status = error.message === 'User is not verified' ? 403 : 401;
    return res.status(status).json({ message: error.message });
  }
});

export default router;
