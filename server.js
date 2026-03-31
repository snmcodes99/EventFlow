const app = require('./app');
const ConnectToDB = require('./config/db');
const { ConnectRedis } = require('./config/redis');

const PORT = 3000;

async function start() {
    await ConnectToDB();
    await ConnectRedis();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

start();