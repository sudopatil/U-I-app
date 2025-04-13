
// // server/app.js
// import express from 'express';
// import cors from 'cors';
// import { registrationRouter } from './controller/registration.controller.js';

// // If your database is still using CommonJS:
// import('./database/drizzle.js'); // Dynamic import to load CJS module

// const app = express();

// // Use JSON body parser middleware
// app.use(express.json());

// app.use(cors());
// app.use(express.json());

// // Routes
// app.use('/api', registrationRouter);

// export default app;


// server/app.js
import express from 'express';
import cors from 'cors';
import { registrationRouter } from './controller/registration.controller.js';
import authRouter from './controller/login.controller.js';

// If your database is still using CommonJS:
import('./database/drizzle.js'); // Dynamic import to load CJS module

const app = express();

// Use JSON body parser middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api', registrationRouter);
app.use('/api', authRouter);

export default app;
