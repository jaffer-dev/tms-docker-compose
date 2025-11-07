const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth')

const approval = require('../controllers/approvals')

router.get('/getApprovals', authMiddleware, approval.getApprovals);
router.post('/approveTaskRequest', authMiddleware, approval.approveTaskRequest);

module.exports = router;
