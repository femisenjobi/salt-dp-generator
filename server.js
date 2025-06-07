require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./server/db');
const dpConfigurationRoutes = require('./server/routes/dpConfigurationRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes - Define API routes BEFORE static files
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

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, 'build')));

// The "catchall" handler: send back React's index.html file for any request
// that doesn't match one of the routes above
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something broke!',
        error: process.env.NODE_ENV === 'production' ? {} : err.message
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
    console.log(`Frontend available at http://localhost:${PORT}`);
});