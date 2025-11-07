const express = require('express');
const router = express.Router();
const {
  applyLeave,
  updateLeaveStatus,
  fetchApprovals
} = require('../controllers/leaves');
const authMiddleware = require('../middleware/auth');

// POST - Apply for Leave
router.post('/apply', authMiddleware, applyLeave);

// PUT - Approve / Reject Leave
router.put('/:leaveId/status', authMiddleware, updateLeaveStatus);

// GET - Fetch leaves requiring approval
router.get('/approvals', authMiddleware, fetchApprovals);

module.exports = router;
