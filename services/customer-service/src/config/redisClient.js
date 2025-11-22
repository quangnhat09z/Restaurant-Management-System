const redis = require('redis');
const env = require('../../../../Backend/environment');

const redisClient = redis.createClient({
  socket: {
    host: env.REDIS_HOST || 'localhost',
    port: env.REDIS_PORT || 6379,
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('❌ Redis: Max reconnection attempts reached');
        return new Error('Max reconnection attempts');
      }
      const delay = Math.min(retries * 100, 3000);
      console.log(
        `🔄 Redis reconnecting... attempt ${retries} (delay: ${delay}ms)`
      );
      return delay;
    },
  },
  password: env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis successfully!');
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Reconnecting to Redis...');
});

process.on('SIGINT', async () => {
  await redisClient.quit();
  console.log('👋 Redis connection closed');
  process.exit(0);
});

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Failed to connect to Redis', err);
    process.exit(1);
  }
})();

module.exports = redisClient;
