const mongoose = require('mongoose');

const publishSchema = new mongoose.Schema({
    type: String,
    data: Object,
    offset: Number
});

publishSchema.index({ type: 1, offset: 1 });

module.exports = mongoose.model('Publish', publishSchema);