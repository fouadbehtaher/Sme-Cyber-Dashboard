const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware للأمان
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Health check (does not touch the database)
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Routes that are implemented and have their dependencies in the repo.
// NOT mounted yet, because the files they need are empty or missing:
//   /api/auth             routes/auth.js, models/User.js (auth policy not decided)
//   /api/assets           routes/assets.js, controllers/assetController.js are empty
//   /api/advanced-queries needs middleware/rbac.js (missing) and SecurityEvent/Asset models
//   /api/vulnerabilities  needs models/Vulnerability.js (empty)
// The incident routes are mounted without authentication, as written. Do not expose this server beyond localhost.
app.use('/api/incidents', require('./routes/incidents'));

// MongoDB connection is explicit, so the app can be loaded (and tested) without a database.
app.connectDb = () => mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/soc_platform');

module.exports = app;
