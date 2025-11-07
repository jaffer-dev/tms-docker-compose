const Comment = require('../models/Comment');
const Task = require('../models/Task');
const User = require('../models/User');

exports.addOrUpdateComment = async (req, res) => {
  try {
    const { taskId, commenterId, commentText } = req.body;

    if (!taskId || !commenterId || !commentText) {
      return res.status(400).json({ 
        success: false,
        message: 'taskId, commenterId, and commentText are required' 
      });
    }

    const user = await User.findById(commenterId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const comment = {
      commenterId,
      name: user.username,
      email: user.email,
      commentText,
      createdAt: new Date()
    };

    let commentThread = await Comment.findOne({ taskId });

    if (commentThread) {
      commentThread.comments.push(comment);
      commentThread.lastUpdated = Date.now();
    } else {
      commentThread = new Comment({
        taskId,
        comments: [comment],
        lastUpdated: Date.now()
      });
    }

    // ✅ Save comment thread
    await commentThread.save();

    // ✅ Also update Task document comments
    await Task.findByIdAndUpdate(taskId, { $push: { comments: comment } });

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      data: comment
    });

  } catch (error) {
    console.error('Error in addOrUpdateComment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getCommentsByTaskId = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ 
        success: false,
        message: 'taskId is required' 
      });
    }

    const comments = await Comment.findOne({ taskId })
      .populate('comments.commenterId', 'username email role')
      .sort({ 'comments.createdAt': -1 });
    
    if (!comments) {
      return res.status(200).json({ 
        success: false,
        message: 'No comments found for this task' 
      });
    }

    res.status(200).json({
      success: true,
      data: comments
    });

  } catch (error) {
    console.error('Error in getCommentsByTaskId:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};