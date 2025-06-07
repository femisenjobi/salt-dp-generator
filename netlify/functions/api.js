const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const connectDB = require('../../server/db');
const dpConfigurationRoutes = require('../../server/routes/dpConfigurationRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Base path for serverless functions is /.netlify/functions/api
// We need to adjust the routes to match this base path
const router = express.Router();

// API Routes
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Custom DP Backend API!' });
});

router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// DP Configuration routes - adjust the path
router.use('/dp-configurations', dpConfigurationRoutes);

// API 404 handler for unmatched API routes
router.all('*', (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

// Use the router with the base path
app.use('/.netlify/functions/api', router);

// Export the serverless function
module.exports.handler = serverless(app);