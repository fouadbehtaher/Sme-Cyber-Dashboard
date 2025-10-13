const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// استيراد routes الجديدة
const advancedQueriesRoutes = require('./routes/advancedQueries');

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

// Routes
app.use('/api/advanced-queries', advancedQueriesRoutes);

// بقية routes...
app.use('/api/incidents', require('./routes/incidents'));
app.use('/api/assets', require('./routes/assets'));
app.use('/api/auth', require('./routes/auth'));

// توصيل MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/soc_platform', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

module.exports = app;
