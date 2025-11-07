const Task = require('../models/Task');

exports.getTaskHistory = async (req, res) => {
  const { id } = req.params;
  console.log(id)
  if (!id) {
    return res.status(400).json({ message: 'Task Id is required' });
  }

  try {
    const tasks = await Task.find({ _id: id })
      .populate('assignedTo')
      .populate('assignedBy')
      .populate('files.uploadedBy')
      .populate('files.viewers')
      .sort({ createdAt: -1 });

    const task = tasks[0];
    const actions = [];

    for (const t of tasks) {
      actions.push({
        action: `Task Created`,
        user: {
          id: t.assignedBy?._id || null,
          username: t.assignedBy?.username || 'Unknown',
        },
        date: t.createdAt,
        type: 'created',
      });

      // Task Assigned
      if (t.assignedTo) {
        actions.push({
          action: `Assigned to ${t.assignedTo.username}`,
          user: {
            id: t.assignedBy?._id || null,
            username: t.assignedBy?.username || 'Unknown',
          },
          assignedTo: {
            id: t.assignedTo?._id || null,
            username: t.assignedTo?.username || 'Unknown',
          },
          date: t.updatedAt || t.createdAt,
          type: 'assigned',
        });
      }

      if (t.status === "closed") {
        actions.push({
          action: `Task Closed`,
          files: t.files,
          date: t.updatedAt || t.createdAt,
          type: t.status,
        });
      }

      if (t.status === "review") {
        actions.push({
          action: `Task Submited for a review`,
          files: t.files,
          date: t.updatedAt || t.createdAt,
          type: t.status,
        });
      }
    }

    actions.sort((a, b) => new Date(b.date) - new Date(a.date));

    const history = {
      id: task._id,
      taskTitle: task.title,
      description: task.description,
      deadline: task.deadline,
      priority: task.priority,
      status: task.status,
      hasFile: task.files?.length > 0,
      files: task.files, // Add the complete files array here
      type: task.type,
      assignTo: task.assignedTo,
      createdBy: {
        id: task.assignedBy?._id || null,
        username: task.assignedBy?.username || 'Unknown',
      },
      actions: task.history,
    };

    return res.status(200).json(history);
  } catch (err) {
    console.error('Error fetching task history:', err);
    return res.status(500).json({ message: 'Server error while retrieving task history' });
  }
};