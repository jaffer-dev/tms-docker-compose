const express = require('express');
const router = express.Router();
const {
  applyLeave,
  updateLeaveStatus,
  fetchApprovals
} = require('../controllers/leaves');
const authMiddleware = require('../middleware/auth');

router.post('/apply', authMiddleware, applyLeave);
router.put('/:leaveId/status', authMiddleware, updateLeaveStatus);
router.get('/get-all-approvals', authMiddleware, fetchApprovals);

module.exports = router;
