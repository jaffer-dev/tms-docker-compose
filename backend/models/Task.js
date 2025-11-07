const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
  type: { type: String, enum: ['TASK', 'BUG', 'MEMO'], default: 'TASK' },
  deadline: Date,
  status: {
    type: String,
    enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'PENDING'],
    default: 'TODO'
  },
  history: [{ type: Object }],
  comments: [{ type: Object }],

  // ✅ Change from String to ObjectId
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },

  files: {
    type: [
      {
        fileName: String,
        fileType: String,
        fileData: Buffer,
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
      }
    ],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
