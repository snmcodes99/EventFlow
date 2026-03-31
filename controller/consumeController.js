const Publish = require('../model/publishModel');

const EventData = async (req, res) => {
    try {
        const offset = parseInt(req.query.offset) || 0;
        const type = req.query.type;

        if (!type) {
            return res.status(400).json({
                message: "type is required"
            });
        }

        const result = await Publish.find({
            type,
            offset: { $gt: offset }
        })
        .sort({ offset: 1 })
        .limit(100);

        const nextOffset = result.length
            ? result[result.length - 1].offset
            : offset;

        return res.status(200).json({
            events: result,
            nextOffset
        });

    } catch (err) {
        return res.status(500).json({
            message: "Error fetching data",
            error: err.message
        });
    }
};

module.exports = EventData;