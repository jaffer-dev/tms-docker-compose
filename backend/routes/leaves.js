const express = require('express');
const router = express.Router();
const {
  applyLeave,
  updateLeaveStatus,
  fetchApprovals,
  applyLeaveReq
} = require('../controllers/leaves');
const authMiddleware = require('../middleware/auth');

router.post('/apply', authMiddleware, applyLeave);
router.put('/:leaveId/status', authMiddleware, updateLeaveStatus);
router.get('/get-all-approvals', authMiddleware, fetchApprovals);
router.post('/applyLeave', authMiddleware, applyLeaveReq);

module.exports = router;
