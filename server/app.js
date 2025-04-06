const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config(); // Add environment variables

// Routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
//const authRouter = require('./routes/auth'); // New auth routes

const app = express();

// Database connection
require('./database/drizzle'); // Initialize Drizzle ORM

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
//app.use('/api/auth', authRouter); // Add auth endpoints

// Import properly with destructuring
//const { transporter } = require('./services/email.service');

// Test email route
app.get('/test-email', async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: `"Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: 'SMTP Test',
      text: 'This is a test email from U&I'
    });
    
    console.log('Test email sent:', info.messageId);
    res.json({
      success: true,
      message: `Test email sent to ${process.env.SMTP_USER}`,
      etherealInbox: 'https://ethereal.email/login'
    });
    
  } catch (error) {
    console.error('Email test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Email test failed',
      error: error.message,
      solution: 'Verify SMTP credentials in .env'
    });
  }
});

module.exports = app;