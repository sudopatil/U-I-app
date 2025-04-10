// server/controller/registration.controller.js
import { Router } from 'express';
import { registerUser, verifyUser, verificationPageTemplate } from '../services/registration.service.js';

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

// // PUT /api/verify?userId=XX&token=YY
// registrationRouter.put('/verify', async (req, res) => {
//   try {
//     const { userId, token } = req.query;
//     const result = await verifyUser(userId, token);
//     return res.status(result.status).json({ message: result.message });
//   } catch (error) {
//     console.error('Error in PUT /verify:', error);
//     return res.status(500).json({ message: 'Server error during verification', error: error.message });
//   }
// });

// // Update controller method to GET
// registrationRouter.get('/verify', async (req, res) => {
//   try {
//     const { userId, token } = req.query;
//     const result = await verifyUser(userId, token);
    
//     // Send HTML response instead of JSON
//     const htmlResponse = verificationTemplate(result.message, result.status === 200);
//     res.status(result.status).send(htmlResponse);
    
//   } catch (error) {
//     const htmlResponse = verificationTemplate(error.message, false);
//     res.status(500).send(htmlResponse);
//   }
// });


registrationRouter.get('/verify', async (req, res) => {
  try {
    const { userId, token } = req.query;
    const result = await verifyUser(userId, token);
    
    // Use verificationPageTemplate instead of verificationTemplate
    const htmlResponse = verificationPageTemplate(result.message, result.status === 200);
    res.status(result.status).send(htmlResponse);
    
  } catch (error) {
    // Use verificationPageTemplate here too
    const htmlResponse = verificationPageTemplate(
      error.message.includes('already verified') ? 
        'Account is already verified' : 
        'Verification failed. Please try again.',
      false
    );
    res.status(500).send(htmlResponse);
  }
});
