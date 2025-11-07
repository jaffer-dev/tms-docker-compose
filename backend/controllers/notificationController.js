// notificationController.js
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.getUserNotifications = async (req, res) => {
  const { userId } = req.params; // Changed from req.body to req.params

  if (!userId) {
    return res.status(400).json({ 
      success: false,
      message: 'User ID is required',
      code: 'MISSING_USER_ID'
    });
  }

  try {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .populate('taskId', 'title dueDate assignedBy assignedTo')
      .populate('userId', 'username')
      .lean();

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications: notifications || [] // Ensure always returning an array
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications',
      code: 'SERVER_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    console.log(notificationId)
    
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    
    res.json({ 
      success: true, 
      message: 'Notification marked as read' 
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

exports.markAllNotificationsAsRead = async (req, res) => {
  const { userId } = req.params; // Changed from req.body to req.params

  if (!userId) {
    return res.status(400).json({ 
      success: false,
      message: 'User ID is required',
      code: 'MISSING_USER_ID'
    });
  }

  try {
    const result = await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    return res.status(200).json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while marking notifications as read',
      code: 'SERVER_ERROR'
    });
  }
};