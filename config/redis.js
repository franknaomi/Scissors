const redis = require('redis');

// In production, use the hosted Redis URL and port
const redisHost = process.env.REDIS_HOST || '127.0.0.1';  // Replace with your Redis host in production
const redisPort = process.env.REDIS_PORT || 6379;         // Replace with your Redis port in production
const redisPassword = process.env.REDIS_PASSWORD || '';   // Set this if using a managed Redis with auth

const client = redis.createClient({
  host: redisHost,
  port: redisPort,
  password: redisPassword
});

client.on('connect', () => {
  console.log('Connected to Redis');
});

client.on('error', (err) => {
  console.error('Redis connection error:', err);
});

module.exports = client;
