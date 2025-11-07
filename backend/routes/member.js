const express = require('express');
const router = express.Router();

const members = require('../controllers/membersController');
const { authorizeRoles } = require('../middleware/authenticate');

router.get('/get-members', authorizeRoles("SUPER_ADMIN"), members.getMembers);

module.exports = router;
