const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // har team ko ek creator hoga
  },
  hodId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Team || mongoose.model('Team', teamSchema);
