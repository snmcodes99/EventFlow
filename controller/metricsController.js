const { getter } = require('../config/redis');

const getMetrics = async (req, res) => {
    try {
        const client = getter();

        const totalEvents = parseInt(await client.get('metrics:totalEvents')) || 0;
        const failedEvents = parseInt(await client.get('metrics:failedEvents')) || 0;

        const type = req.query.type || 'email';
        const consumerOffset = parseInt(req.query.offset) || 0;

        const latestOffset = parseInt(await client.get(`latestOffset:${type}`)) || 0;

        const lag = latestOffset - consumerOffset;

        return res.status(200).json({
            totalEvents,
            failedEvents,
            consumerLag: lag
        });

    } catch (err) {
        return res.status(500).json({
            message: "Error fetching metrics",
            error: err.message
        });
    }
};

module.exports = getMetrics;