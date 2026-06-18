const REQUIRED_VARS = ['MONGO_URI', 'JWT_SECRET'];

const validateEnv = () => {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(
      `Missing required environment variables:\n  ${missing.join('\n  ')}\n\n` +
      'Create a .env file in server/ with:\n' +
      '  PORT=5000\n  MONGO_URI=mongodb://localhost:27017/indianic_hrm\n  JWT_SECRET=your_secret\n  JWT_EXPIRE=7d'
    );
    process.exit(1);
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 16) {
    console.warn('Warning: JWT_SECRET should be at least 16 characters in production');
  }

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.CLIENT_URL) {
      console.error('CLIENT_URL must be set in production');
      process.exit(1);
    }
  }
};

module.exports = { validateEnv };
