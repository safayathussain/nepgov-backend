const Redis = require("redis");

const connectRedis = () => {
  const redisClient = Redis.createClient({
    url: `redis://:${process.env.REDIS_PASS}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  });
  redisClient
    .connect()
    .then(() => console.log("Redis connected"))
    .catch((err) => console.error("Redis connection error:", err));

  return redisClient;
};
module.exports = connectRedis;
