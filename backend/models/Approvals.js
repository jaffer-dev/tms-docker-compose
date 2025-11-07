const mongoose = require("mongoose");

const approvalSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: { type: String, enum: ["MEMO", "TASK", "BUG"], required: true },
  priority: { type: String, default: "LOW" },
  deadline: Date,
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // employee
  requestedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // HOD
  assignTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, //
  status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Approval", approvalSchema);
