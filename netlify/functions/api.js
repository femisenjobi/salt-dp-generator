const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const connectDB = require('../../server/db');
const DpConfiguration = require('../../server/models/DpConfiguration');
const User = require('../../server/models/User'); // Added User model
const shortid = require('shortid');
const jwt = require('jsonwebtoken'); // Added jsonwebtoken
const bcrypt = require('bcryptjs'); // Added bcryptjs

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.originalUrl} (path: ${req.path})`);
  next();
});

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ message: 'Authentication token required.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(403).json({ message: 'Token is not valid or has expired.' });
    }
    req.user = user; // Add decoded user payload to request object
    next();
  });
};

// Strip the /.netlify/functions/api prefix if present
app.use((req, res, next) => {
  if (req.path.startsWith('/.netlify/functions/api')) {
    req.url = req.url.replace('/.netlify/functions/api', '');
  }
  next();
});

// GET /dp-configurations - Fetch all public DP Configurations
app.get('/dp-configurations', async (req, res) => {
  try {
    console.log('Fetching all public DP configurations');
    const publicConfigurations = await DpConfiguration.find({});
    console.log(`Found ${publicConfigurations.length} configurations`);
    res.status(200).json(publicConfigurations || []);
  } catch (error) {
    console.error('Error fetching DP Configurations:', error);
    res.status(500).json({ message: 'Server error while fetching DP configurations.' });
  }
});

// GET /dp-configurations/public/all - Get all DP Configurations
app.get('/dp-configurations/public/all', async (req, res) => {
  try {
    console.log('Fetching all DP configurations');
    const configurations = await DpConfiguration.find({});
    console.log(`Found ${configurations.length} configurations`);
    res.status(200).json(configurations);
  } catch (error) {
    console.error('Error fetching DP configurations:', error);
    res.status(500).json({
      message: "Error fetching DP configurations",
      error: error.message
    });
  }
});

// POST /dp-configurations - Create a new DP Configuration
app.post('/dp-configurations', authenticateToken, async (req, res) => { // Added authenticateToken middleware
  console.log('Creating new DP configuration for user:', req.user.id); // Log which user is creating
  const {
    mainImageCloudinaryId,
    logoImageCloudinaryId,
    width,
    height,
    xPos,
    yPos,
    radius,
    templateName,
    customSlug,
    isPublic
  } = req.body;

  try {
    if (!mainImageCloudinaryId || !width || !height) {
      return res.status(400).json({ message: 'Missing required fields: mainImageCloudinaryId, width, height, xPos, yPos.' });
    }
    
    // Set default logo if not provided
    const logoToUse = logoImageCloudinaryId || 'plain_pw7uoh';

    let slugToUse;
    if (customSlug) {
      let sanitizedSlug = customSlug
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      if (!sanitizedSlug) {
        sanitizedSlug = shortid.generate();
      }

      let existingBySlug = await DpConfiguration.findOne({ slug: sanitizedSlug });
      if (existingBySlug) {
        let counter = 1;
        let newAttemptSlug;
        do {
          newAttemptSlug = `${sanitizedSlug}-${counter}`;
          existingBySlug = await DpConfiguration.findOne({ slug: newAttemptSlug });
          counter++;
        } while (existingBySlug);
        slugToUse = newAttemptSlug;
      } else {
        slugToUse = sanitizedSlug;
      }
    } else {
      let newSlug = shortid.generate();
      let attempts = 0;
      while (await DpConfiguration.findOne({ slug: newSlug }) && attempts < 5) {
        newSlug = shortid.generate();
        attempts++;
      }
      if (await DpConfiguration.findOne({ slug: newSlug })) {
        return res.status(500).json({ message: 'Failed to generate a unique slug after multiple attempts.' });
      }
      slugToUse = newSlug;
    }

    const configData = {
      slug: slugToUse,
      mainImageCloudinaryId,
      logoImageCloudinaryId: logoToUse,
      width,
      height,
      xPos,
      yPos,
      radius,
      templateName,
      userId: req.user.id // Associate with authenticated user
    };

    if (typeof isPublic === 'boolean') {
      configData.isPublic = isPublic;
    }

    const newDpConfiguration = new DpConfiguration(configData);
    const savedConfiguration = await newDpConfiguration.save();
    console.log('DP configuration created successfully for user:', req.user.id);
    res.status(201).json(savedConfiguration);

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: 'Validation Error', errors: messages });
    }
    console.error('Error creating DP Configuration:', error);
    res.status(500).json({ message: 'Server error while creating DP configuration.' });
  }
});

// GET /dp-configurations/:slug - Fetch a single DP Configuration by slug
app.get('/dp-configurations/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`Fetching DP configuration with slug: ${slug}`);
    const configuration = await DpConfiguration.findOne({ slug });

    if (!configuration) {
      console.log(`Configuration with slug ${slug} not found`);
      return res.status(404).json({ message: 'Configuration not found.' });
    }

    if (!configuration.isPublic) {
      console.log(`Configuration with slug ${slug} is not public`);
      return res.status(404).json({ message: 'Configuration not public.' });
    }

    console.log(`Found configuration with slug ${slug}`);
    res.status(200).json(configuration);
  } catch (error) {
    console.error(`Error fetching DP Configuration with slug ${req.params.slug}:`, error);
    res.status(500).json({ message: 'Server error while fetching DP configuration.' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Custom DP Backend API!' });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// POST /auth/register - Register a new user
app.post('/auth/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    // Create new user instance (password will be hashed by pre-save hook)
    const newUser = new User({ username, password });
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    res.status(201).json({ token });

  } catch (error) {
    console.error('Error during user registration:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// POST /auth/login - Login an existing user
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // User not found
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // Password doesn't match
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    res.status(200).json({ token });

  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// Catch-all route for any other API endpoints
app.all('*', (req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    message: "API endpoint not found", 
    path: req.path,
    method: req.method,
    url: req.url
  });
});

// Export the serverless function with path stripping
module.exports.handler = serverless(app);