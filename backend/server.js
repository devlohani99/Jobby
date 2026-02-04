require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const { handleErrors } = require('./middleware/handleErrors');

// Import routes
const signUpRoute = require('./routes/signUpRoute');
const signInRoute = require('./routes/signInRoute');
const logoutRoute = require('./routes/logoutRoute');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const remoteJobsRoute = require('./routes/remoteJobs');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://frontjobby.vercel.app',
    'https://jobby-frontend.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for uploaded resumes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Auth routes
app.use('/api/auth', signUpRoute);
app.use('/api/auth', signInRoute);
app.use('/api/auth', logoutRoute);

// Job and application routes
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api', remoteJobsRoute);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Jobby API is running',
    version: '2.0.0',
    features: [
      'User Authentication',
      'Job Management',
      'Application Tracking',
      'Resume Upload',
      'Advanced Search'
    ]
  });
});

app.use(handleErrors);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});