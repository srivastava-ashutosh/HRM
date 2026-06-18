const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const { validateEnv } = require('./utils/env');

dotenv.config();
validateEnv();

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { message: 'Too many login attempts, please try again later' },
});

app.use(helmet());
app.use(cors(corsOptions));
app.use(limiter);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static('uploads'));

app.use('/api/auth/login', authLimiter);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/pim', require('./routes/pim'));
app.use('/api/leave', require('./routes/leave'));
app.use('/api/time', require('./routes/time'));
app.use('/api/recruitment', require('./routes/recruitment'));
app.use('/api/performance', require('./routes/performance'));
app.use('/api/buzz', require('./routes/buzz'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/directory', require('./routes/directory'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/training', require('./routes/training'));
app.use('/api/assets', require('./routes/assets'));
app.use('/api/helpdesk', require('./routes/tickets'));
app.use('/api/exit', require('./routes/exit'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', version: '1.0.0', name: 'IndiaNIC HRM API' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      mongoose.connection.close(false).then(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
    setTimeout(() => {
      console.error('Forced shutdown after 10s timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
});
