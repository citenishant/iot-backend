const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    status: { type: String, default: 'offline' },
    data: { type: Object, default: {} },
});

module.exports = mongoose.model('Device', deviceSchema);