import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

export let redisClient = createClient({
	url: process.env.REDIS_CONNECTION
});

export const createRedisConnection = async () => {
	try {
		// process.env.REDIS_CONNECTION
		redisClient.connect();
		redisClient.on('connect', () => console.log('💖 Redis Client Connected 💖'));
		redisClient.on('error', (err) => console.log('⛔ Redis Client Error ⛔'));
		process.on("SIGINT", () => {
			redisClient.quit();
		});
	} catch (error) {
		console.log(`An exception occurred while creating the Redis connec
	}
}