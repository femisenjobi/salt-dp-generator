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

// API Routes
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Custom DP Backend API!' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// DP Configuration routes
app.use('/api/dp-configurations', dpConfigurationRoutes);

// API 404 handler for unmatched API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

// Export the serverless function
module.exports.handler = serverless(app);