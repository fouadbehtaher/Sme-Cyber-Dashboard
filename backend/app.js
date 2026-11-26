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

// Auth/tenant policy is NOT decided yet (no User model, no auth routes, no RBAC middleware,
// and incidents require a tenant_id). Until it is, every data endpoint fails closed.
// Only /health is open, and it reports nothing about the database.
const failClosed = (req, res) => res.status(503).json({
    message: 'Disabled: authentication and tenant policy are not configured.'
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Implemented but disabled: routes/incidents.js (tests mount the router directly with mocked models).
// Not implemented: /api/auth, /api/assets, /api/vulnerabilities, /api/advanced-queries (needs middleware/rbac.js).
app.use('/api', failClosed);

// MongoDB connection is explicit, so the app can be loaded (and tested) without a database.
app.connectDb = () => mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/soc_platform');

module.exports = app;
