const DLQ = require('../model/dlqModel');
const { getter } = require('../config/redis');

const addToDLQ = async (req, res) => {
    try {
        const client = getter();
        const { type, data, offset, reason } = req.body;

        if (!type || !data || offset === undefined) {
            return res.status(400).json({
                message: "type, data, and offset are required"
            });
        }

        const saved = await DLQ.create({
            type,
            data,
            offset,
            reason: reason || "Processing failed"
        });

        await client.incr('metrics:failedEvents');

        return res.status(200).json({
            message: "Event moved to DLQ",
            data: saved
        });

    } catch (err) {
        return res.status(500).json({
            message: "Error saving to DLQ",
            error: err.message
        });
    }
};

module.exports = addToDLQ;