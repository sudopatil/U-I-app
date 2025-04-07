// server/controller/registration.controller.js
import { Router } from 'express';
import { registerUser, verifyUser } from '../services/registration.service.js';

export const registrationRouter = Router();

// POST /api/register
registrationRouter.post('/register', async (req, res) => {
  try {
    const result = await registerUser(req.body);
    return res.status(result.status).json({ message: result.message, data: result.data });
  } catch (error) {
    console.error('Error in POST /register:', error);
    return res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// PUT /api/verify?userId=XX&token=YY
registrationRouter.put('/verify', async (req, res) => {
  try {
    const { userId, token } = req.query;
    const result = await verifyUser(userId, token);
    return res.status(result.status).json({ message: result.message });
  } catch (error) {
    console.error('Error in PUT /verify:', error);
    return res.status(500).json({ message: 'Server error during verification', error: error.message });
  }
});
