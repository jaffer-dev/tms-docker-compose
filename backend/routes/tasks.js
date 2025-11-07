const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

const taskController = require('../controllers/taskController')
const history = require('../controllers/historytracker')
const task = require('../controllers/taskController')
const authMiddleware = require('../middleware/auth')

//Routes
router.post('/create', task.createTask);
router.put("/update-status", taskController.updateTaskStatus);
router.put("/edit", taskController.editTask);
router.get('/history/:id', history.getTaskHistory);
router.post('/all-task', authMiddleware, task.getUserTask);
router.put('/assign-task', task.assignTask);

router.post('/upload-work', upload.array('files', 5), task.uploadWork);

// router.post('/hr-assigned-tasks', task.getHrAssignedTasks); de
// router.post('/get-task-by-status', task.getTasksByStatus); d


module.exports = router;
