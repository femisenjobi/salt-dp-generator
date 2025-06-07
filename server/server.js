require('dotenv').config(); // Load environment variables at the very top
const express = require('express');
const path = require("path");
const cors = require('cors');
const connectDB = require('./db'); // Import DB connection function
const cloudinary = require('./cloudinaryConfig'); // Import Cloudinary configured instance
const dpConfigurationRoutes = require('./routes/dpConfigurationRoutes'); // Will be used in route handlers later

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // Enable CORS for all routes and origins
app.use(express.json()); // Parse JSON request bodies

// Basic Test Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Custom DP Backend API!' });
});

// Placeholder for API routes (to be implemented in next steps)
app.use('/api/dp-configurations', dpConfigurationRoutes);

// Global Error Handler (very basic example, can be expanded)

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "..", "build")));

// The "catchall" handler: for any request that doesnt
// match one above, send back Reacts index.html file.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // You can also log Cloudinary config status here if needed
    if (cloudinary.config().cloud_name) {
        console.log(`Cloudinary configured for cloud: ${cloudinary.config().cloud_name}`);
    } else {
        console.warn('Cloudinary is not configured. Check .env variables and cloudinaryConfig.js');
    }
});
