// models/Role.js
const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    accessRights: [
        {
            module: { type: String, required: true },
            actions: [{ type: String, required: true }]
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Role', roleSchema);
