const redis = require('redis');
const redisClient = redis.createClient();

redisClient.on('error', (err) => console.log('Redis client err', err));
redisClient.connect();

module.exports = { redisClient }