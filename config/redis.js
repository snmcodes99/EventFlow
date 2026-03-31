const redis = require('redis')
const createClient = redis.createClient;


let client;

const ConnectRedis = async () => {
    try {
        client = createClient({
            username: 'default',
            password: 'pass',
            socket: {
                host: 'redis',
                port: xyz
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
