import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const { REDIS_HOST, REDIS_PASSWORD } = process.env;

export const redisStore = new Redis({
  port: 6379,
  host: REDIS_HOST,
  password: REDIS_PASSWORD,
});
