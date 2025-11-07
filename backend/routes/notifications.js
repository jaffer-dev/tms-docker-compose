const express = require('express');
const router = express.Router();

const notification = require('../controllers/notificationController');


router.get('/get-notifications/:userId', notification.getUserNotifications);

router.patch('/readed-notification/:notificationId', notification.markNotificationAsRead);

router.patch('/read-all-notifications/:userId/read-all', notification.markAllNotificationsAsRead);


module.exports = router;