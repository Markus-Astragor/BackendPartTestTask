const redis = require('redis');
const redisClient = redis.createClient();

redisClient.on('error', (err) => console.log('Redis client err', err));
redisClient.connect({
  url: 'redis://redis_database:6379'
});

module.exports = { redisClient }