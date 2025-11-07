const express = require('express');
const router = express.Router();

const comments = require('../controllers/commentController');


router.post('/Add-comments', comments.addOrUpdateComment);
router.get('/get-comments/:taskId', comments.getCommentsByTaskId);

module.exports = router;