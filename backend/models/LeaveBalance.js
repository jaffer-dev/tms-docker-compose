const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  totalLeaves: { type: Number, default: 32 },
  annual: { type: Number, default: 14 },
  casual: { type: Number, default: 10 },
  sick: { type: Number, default: 8 },
  taken: {
    annual: { type: Number, default: 0 },
    casual: { type: Number, default: 0 },
    sick: { type: Number, default: 0 }
  },
  remaining: {
    annual: { type: Number, default: 14 },
    casual: { type: Number, default: 10 },
    sick: { type: Number, default: 8 }
  },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);
