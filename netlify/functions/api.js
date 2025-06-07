const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const connectDB = require('../../server/db');
const DpConfiguration = require('../../server/models/DpConfiguration');
const shortid = require('shortid');
const dpConfigurationRoutes = require('../../server/routes/dpConfigurationRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Custom DP Backend API!' });
});

app.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.use('/dp-configurations', dpConfigurationRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "API endpoint not found", path: req.path });
});

module.exports.handler = serverless(app);