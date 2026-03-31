const redis = require('redis')
const createClient = redis.createClient;


let client;

const ConnectRedis = async () => {
    try {
        client = createClient({
            username: 'default',
            password: 'dGOmLlP48VfWZSbEOdrTvBRpz0NVo4zQ',
            socket: {
                host: 'redis-15995.c267.us-east-1-4.ec2.cloud.redislabs.com',
                port: 15995
            }
        });

        client.on('error', err => console.log('Redis Client Error', err));

        await client.connect();
        await client.flushAll();
        console.log("Connected to Redis");
    } catch (error) {
        console.log(error);
    }
}

const getter = () => client;

module.exports = {ConnectRedis,getter};