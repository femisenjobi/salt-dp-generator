const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken'); // Used for signing test tokens
const bcrypt = require('bcryptjs'); // For mocking
const User = require('../../server/models/User'); // To be mocked
const connectDB = require('../../server/db'); // To be mocked (or use in-memory)

// Mock environment variables
process.env.JWT_SECRET = 'testsecret';

// Mock the User model
jest.mock('../../server/models/User');
// Mock bcrypt
jest.mock('bcryptjs');
// Mock connectDB
jest.mock('../../server/db', () => jest.fn());

// Import the parts of api.js we need to test.
// This is tricky because api.js connects to DB and exports handler.
// We need to re-wire it for testing.
// A better approach would be to refactor api.js to export the app instance
// before wrapping with serverless-http, or export router modules.

// For now, let's try to import the app setup logic carefully.
// We need to re-create a minimal app instance and attach routes.
const apiRouter = express.Router(); // Create a router to attach our routes

// Manually add routes from api.js to apiRouter
// This is a simplified version of what's in api.js
// We're assuming api.js has structure like:
// const app = express(); ... app.post('/auth/register', ...) etc.
// We need to extract that logic or replicate it.

// --- Begin Replicated/Imported Logic from api.js ---
// This section would ideally be an import of the configured Express app or router
const app = express();
app.use(express.json());

// Middleware to authenticate JWT token (copied from api.js for test setup)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// POST /auth/register
apiRouter.post('/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists.' });
    }
    // Password hashing is mocked or handled by mocked User model
    const newUser = new User({ username, password });
    await newUser.save(); // Mocked save
    const token = jwt.sign({ id: newUser._id, username: newUser.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
});

// POST /auth/login
apiRouter.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.password); // Mocked compare
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// Example protected route for testing authenticateToken
apiRouter.get('/protected', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Access granted', user: req.user });
});

app.use('/api', apiRouter); // Mount the router under /api prefix like in actual app

// --- End Replicated/Imported Logic ---

describe('Auth API Endpoints', () => {
  // Reset mocks before each test
  beforeEach(() => {
    User.findOne.mockReset();
    User.prototype.save.mockReset();
    bcrypt.compare.mockReset();
    // jwt.verify is part of the authenticateToken middleware, it's more of an integration test for that part
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      User.findOne.mockResolvedValue(null); // No existing user
      User.prototype.save.mockResolvedValue({ _id: 'mockUserId', username: 'testuser' }); // Mock save

      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(User.prototype.save).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if username already exists', async () => {
      User.findOne.mockResolvedValue({ _id: 'mockUserId', username: 'existinguser' }); // User exists

      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'existinguser', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username already exists.');
    });

     it('should return 400 if username or password is not provided', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser' }); // Missing password

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username and password are required.');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user successfully', async () => {
      const mockUser = { _id: 'mockUserId', username: 'testuser', password: 'hashedPassword' };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true); // Passwords match

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    });

    it('should return 401 if user not found', async () => {
      User.findOne.mockResolvedValue(null); // User not found

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nouser', password: 'password123' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials.');
    });

    it('should return 401 if password does not match', async () => {
      const mockUser = { _id: 'mockUserId', username: 'testuser', password: 'hashedPassword' };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false); // Passwords do not match

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials.');
    });
  });

  describe('authenticateToken Middleware', () => {
    // Mock jwt.verify for these specific tests
    // We need to import the original jwt to mock its verify method
    const actualJwt = jest.requireActual('jsonwebtoken');
    let verifyMock;

    beforeEach(() => {
        verifyMock = jest.spyOn(actualJwt, 'verify');
        // For the authenticateToken middleware tests, we re-spy on jwt.verify
        // because the middleware uses jwt.verify directly.
        // The global jwt mock might not apply as expected inside the middleware if not handled carefully.
        // For this test, we are re-defining the app and middleware, so we need to mock `jwt.verify` used by *this* instance of middleware.
        // This is getting complicated due to the test setup. A better setup would make this cleaner.
    });

    afterEach(() => {
        if (verifyMock) verifyMock.mockRestore();
    });


    it('should grant access for a valid token', async () => {
      const userPayload = { id: 'mockUserId', username: 'testuser' };
      const token = jwt.sign(userPayload, process.env.JWT_SECRET);

      // Mocking jwt.verify for the authenticateToken middleware's usage
      // This is tricky because the middleware is defined in the same file.
      // The simplest here is to assume jwt.verify works as expected and test the flow.
      // Or, if testing the middleware in isolation, provide a mock of jwt.verify.
      // Given the current setup, we're testing the route *using* the middleware.

      // For this test, we'll rely on the actual jwt.verify since we signed a token with the same secret.
      // If jwt.verify was mocked globally, this test would need adjustment.

      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toMatchObject(userPayload);
    });

    it('should return 403 for an invalid token signature', async () => {
      const token = jwt.sign({ id: '123' }, 'wrongsecret'); // Signed with wrong secret

      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(403);
    });

    it('should return 403 for an expired token', async () => {
        const userPayload = { id: 'mockUserId', username: 'testuser' };
        const expiredToken = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '0s' });

        // Wait for token to actually expire
        await new Promise(resolve => setTimeout(resolve, 50));

        const response = await request(app)
            .get('/api/protected')
            .set('Authorization', `Bearer ${expiredToken}`);
        expect(response.status).toBe(403);
    });

    it('should return 401 if no token is provided', async () => {
      const response = await request(app)
        .get('/api/protected');
      expect(response.status).toBe(401);
    });

    it('should return 401 for a malformed token (no Bearer)', async () => {
      const token = jwt.sign({ id: '123' }, process.env.JWT_SECRET);
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', token); // Missing "Bearer "
      expect(response.status).toBe(401);
    });
  });
});

// To run these tests:
// 1. Ensure you have a "test" script in package.json: "test": "jest"
// 2. Run `npm test netlify/functions/api.auth.test.js` or similar jest command.
// Jest might require some configuration in jest.config.js for moduleNameMapper if using path aliases,
// or for handling specific ES6 features if not using Babel/transform.
// For this setup, it assumes User model and bcrypt are correctly mocked.
// The connectDB mock prevents actual DB connection attempts.
// The JWT_SECRET is set for consistency.
// The app setup for testing is a simplified replication. Ideally, your actual app instance from api.js would be exported for testing.
// This would involve refactoring api.js to export 'app' before wrapping it with 'serverless(app)'.
// e.g., in api.js: `const app = express(); ... module.exports.app = app; module.exports.handler = serverless(app);`
// Then in test: `const { app } = require('./api');` (with path adjustments)
// This current test file re-defines routes and middleware for testing purposes due to the typical serverless export structure.
// This is a common challenge when testing serverless functions that bundle the whole app.
