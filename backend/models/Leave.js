const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['ANNUAL','CASUAL','SICK','WFH'], required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  days: { type: Number, required: true }, // computed
  reason: String,
  status: { type: String, enum: ['PENDING','APPROVED','REJECTED','CANCELLED'], default: 'PENDING' },
  requestedAt: { type: Date, default: Date.now },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  meta: { type: Object } // for attachments, supporting docs etc.
},{ timestamps:true });

leaveSchema.index({ userId:1, startDate:1, endDate:1 });

module.exports = mongoose.model('Leave', leaveSchema);
