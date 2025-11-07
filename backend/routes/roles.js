const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth')

const roles = require('../controllers/roleController')

router.post('/create', authMiddleware, roles?.createRole);
router.get('/all', authMiddleware, roles?.getRole);
// router.post('/approveTaskRequest', authMiddleware, roles.createRole);

module.exports = router;
