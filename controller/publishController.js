const Publish = require('../model/publishModel');
const { getter } = require('../config/redis');

const PublishEvent = async (req, res) => {
    try {
        const client = getter();
        const { type, data } = req.body;

        if (!type || !data) {
            return res.status(400).json({
                message: "type and data are required"
            });
        }

        const newOffset = await client.incr(`offset:${type}`);

        const result = await Publish.create({
            type,
            data,
            offset: newOffset
        });

        await client.incr('metrics:totalEvents');
        await client.set(`latestOffset:${type}`, newOffset);

        return res.status(200).json({
            message: "data received",
            data: result
        });

    } catch (err) {
        return res.status(500).json({
            message: "Error publishing event",
            error: err.message
        });
    }
};

module.exports = PublishEvent;