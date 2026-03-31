const mongoose = require('mongoose');

const dlqSchema = new mongoose.Schema({
    type: String,
    data: Object,
    offset: Number,
    reason: String,
    failedAt: {
        type: Date,
        default: Date.now
    }
});

dlqSchema.index({ type: 1, offset: 1 });

module.exports = mongoose.model('DLQ', dlqSchema);