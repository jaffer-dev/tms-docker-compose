const User = require('../models/User');
const Task = require('../models/Task');
const Team = require('../models/Team');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');  // Add this line
const mongoose = require('mongoose');
const STATUS = require('../constants/taskStatus');
const Approval = require('../models/Approvals');
const { sendTeamsNotification } = require('../utils/sendTeamsNotification');

// sendTeamsNotification('new task', 'new task created please review');

const JWT_SECRET = process.env.JWT_SECRET

// create task 
exports.createTask = async (req, res) => {
  const { title, description, assignTo, deadline, priority, assignedBy, type } = req.body;

  if (!title || !description || !assignTo || !assignedBy || !type) {
    return res.status(400).json({
      message: 'Missing required fields',
      required: ['title', 'description', 'assignTo', 'assignedBy', 'type'],
      received: Object.keys(req.body)
    });
  }

  try {
    // Find Assignee & Assigner
    const [assignedUser, assignerUser] = await Promise.all([
      User.findOne({ _id: assignTo }),
      User.findOne({ _id: assignedBy }),
    ]);

    if (!assignedUser) return res.status(404).json({ message: `Assignee ${assignTo} not found` });
    if (!assignerUser) return res.status(404).json({ message: `Assigner ${assignedBy} not found` });

    const assignerRole = assignerUser.role;
    const assigneeRole = assignedUser.role;

    // 🔹 EMPLOYEE → create Approval instead of Task
    if (assignerRole === "EMPLOYEE" || assignerRole === "SUPERVISOR") {
      // Find HOD of the employee's department
      const hod = await User.findOne({ "department._id": assignerUser.department._id, role: "HOD" });
      if (!hod) {
        return res.status(400).json({ message: "No HOD found for this employee's department" });
      }

      const approval = new Approval({
        title,
        description,
        type,
        priority: priority || "LOW",
        deadline: deadline ? new Date(deadline) : null,
        requestedBy: assignerUser._id,
        requestedTo: hod._id,
        assignTo: assignedUser._id, // jis HOD ko employee ne choose kiya
        status: "PENDING"
      });

      await approval.save();

      // Notify HOD for approval
      const notif = new Notification({
        userId: hod._id,
        type: 'approval_request',
        message: `${assignerUser.username} requested approval for task "${title}"`,
        read: false
      });
      await notif.save();

      // await sendTeamsNotification(
      //   "New Task Assigned",
      //   `${assignerUser.username} assigned **${updatedTask.title}** to ${assigneeUser.username}`
      // );

      return res.status(201).json({
        success: true,
        message: "Task request submitted for approval",
        approval
      });
    }

    // 🔹 SUPER_ADMIN / MANAGER / SUB_ADMIN → HOD only
    if (['SUPER_ADMIN', 'MANAGER', 'SUB_ADMIN'].includes(assignerRole)) {
      if (assigneeRole !== 'HOD') {
        return res.status(400).json({
          message: `As ${assignerRole}, you can only assign tasks to HOD`
        });
      }
    }

    // 🔹 HOD can directly assign tasks (skip restriction)
    if (!['SUPER_ADMIN', 'MANAGER', 'SUB_ADMIN', 'HOD'].includes(assignerRole)) {
      return res.status(403).json({ message: 'This role is not allowed to create tasks' });
    }

    // Deadline parse
    let parsedDeadline = deadline ? new Date(deadline) : null;
    if (parsedDeadline && isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({ message: 'Invalid deadline format' });
    }

    const getHODTeamMembers = type === "MEMO"
      ? await User.find({ _id: { $ne: assignedUser._id }, "department._id": assignedUser.department._id }).select("_id")
      : []

    const getHODTeamMembersId = getHODTeamMembers.map((user) => user._id);

    const actionType = () => {
      if (type === "MEMO") {
        return {
          action: `Assigned To ${assignedUser?.department?.title} department`,
          date: new Date(),
          type: 'assigned'
        }
      }
      return {
        action: `Assigned to ${assignedUser.username}`,
        user: { id: assignerUser._id, username: assignerUser.username },
        assignedTo: { id: assignedUser._id, username: assignedUser.username },
        date: new Date(),
        type: 'assigned'
      }
    }

    // Create Task
    const newTask = new Task({
      title,
      description,
      priority: priority || 'LOW',
      deadline: parsedDeadline,
      status: 'TODO',
      assignedBy: assignerUser._id,
      assignedTo: [assignedUser._id, ...getHODTeamMembersId],
      createdBy: assignerUser._id,
      type,
      history: [
        {
          action: `Task Created`,
          user: { id: assignerUser._id, username: assignerUser.username },
          date: new Date(),
          type: 'created'
        },
        actionType()
      ]
    });

    await newTask.save();

    // Notifications
    const assignedUsers = [assignedUser._id, ...getHODTeamMembersId];

    const notifications = assignedUsers.map(userId => ({
      userId,
      taskId: newTask._id,
      type: 'task_assigned',
      message: `${assignerUser.username} assigned you "${title}"`,
      read: false
    }));

    await Notification.insertMany(notifications);

    // await sendTeamsNotification(
    //   "New Task Assigned",
    //   `${assignerUser.username} assigned **${updatedTask.title}**`
    // );

    res.status(201).json({
      success: true,
      message: `Task created successfully (${type === "MEMO" ? "Admin → HOD + Team" : "Admin/HOD → HOD"})`,
      task: newTask,
      notification: notifications
    });

  } catch (error) {
    console.error('Error in createTask:', error);
    res.status(500).json({ message: 'Server error creating task', error: error.message });
  }
};

// Assign Task 
exports.assignTask = async (req, res) => {
  const { taskId, assigneeId, assignerId } = req.body;

  // Validate required IDs
  if (!taskId || !assigneeId || !assignerId) {
    return res.status(400).json({
      message: 'Missing required IDs',
      required: ['taskId', 'assigneeId', 'assignerId']
    });
  }

  try {
    // Fetch all required data in parallel
    const [existingTask, assigneeUser, assignerUser] = await Promise.all([
      Task.findById(taskId),
      User.findById(assigneeId),
      User.findById(assignerId)
    ]);

    // Validate all entities exist
    if (!existingTask) return res.status(404).json({ message: 'Task not found' });
    if (!assigneeUser) return res.status(404).json({ message: 'Assignee not found' });
    if (!assignerUser) return res.status(404).json({ message: 'Assigner not found' });

    const action = {
      action: `Assigned to ${assigneeUser.username}`,
      user: {
        id: assignerUser._id,
        username: assignerUser.username,
      },
      assignedTo: {
        id: assigneeUser._id,
        username: assigneeUser.username,
      },
      isAssigned: true,
      date: new Date(),
      type: 'assigned',
    };

    // Update task using findByIdAndUpdate
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        $set: {
          assignedBy: assignerId,
          assignedTo: assigneeId,
        },
        $push: { history: action }
      },
      { new: true, runValidators: true }
    );


    // Create notification (with error handling)
    let notification;
    try {
      notification = new Notification({
        userId: assigneeUser._id,
        taskId: updatedTask._id,  // Use updatedTask instead of existingTask
        type: 'task_assigned',
        message: `${assignerUser.username} assigned you "${updatedTask.title}"`,
        read: false
      });
      await notification.save();
    } catch (notifError) {
      console.error('Notification creation failed:', notifError);
      // Continue without failing the whole operation
    }

    await Promise.all([assignerUser.save(), assigneeUser.save()]);

    res.status(200).json({
      success: true,
      message: 'Task assigned successfully',
      task: updatedTask,
      notification: notification || { warning: 'Notification not created' },
      monthlyTasks: assigneeUser.monthlyTasks
    });

  } catch (error) {
    console.error('Task assignment error:', {
      message: error.message,
      stack: error.stack,
      errors: error.errors
    });
    res.status(500).json({
      success: false,
      message: 'Server error during task assignment',
      error: error.message
    });
  }
};

// HR Assigned Tasks
exports.getHrAssignedTasks = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const hrUser = await User.findOne({ email });
    if (!hrUser) return res.status(404).json({ message: 'HR user not found' });

    const tasks = await Task.find({ assignedBy: hrUser._id }) // ✅ use ObjectId
      .populate('assignedTo', 'username')
      .populate('assignedBy', 'username'); // Optional

    res.json({ tasks });
  } catch (err) {
    console.error('Error fetching HR assigned tasks:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// get users task on behalf on roles if super admin and manager use this he get all task otherwise department and users based fetching 
exports.getUserTask = async (req, res) => {
  try {
    const { _id: userId, role } = req.user;
    const { status, id, priority } = req.body || {};

    const user = await User.findById(userId)
      .select("department")
      .lean();

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // ✅ Build query
    const queryConditions = {};
    if (priority && priority !== "ALL") queryConditions.priority = priority;
    if (status && status !== "ALL") queryConditions.status = status;

    let orConditions = [];

    if (["MANAGER", "SUB_ADMIN", "SUPER_ADMIN"].includes(role)) {
      if (id) orConditions = [{ assignedTo: id }, { assignedBy: id }];
    } 
    else if (["HOD", "SUPERVISOR"].includes(role)) {
      const departmentId = user.department?._id;
      if (!departmentId) {
        return res.status(400).json({
          error: true,
          message: "User department not found",
          code: "MISSING_DEPARTMENT",
        });
      }

      const [deptMembers] = await Promise.all([
        id
          ? Promise.resolve([{ _id: id }])
          : User.find({ "department._id": departmentId }).select("_id").lean(),
      ]);

      const memberIds = deptMembers.map((m) => m._id);
      orConditions = [
        { assignedTo: { $in: memberIds } },
        { assignedBy: { $in: memberIds } },
      ];
    } 
    else {
      orConditions = [{ assignedTo: userId }, { assignedBy: userId }];
    }

    if (orConditions.length) queryConditions.$or = orConditions;

    // ✅ Aggregation
    const tasks = await Task.aggregate([
      { $match: queryConditions },
      { $sort: { createdAt: -1 } },
      { $limit: 300 },

      // assignedBy
      {
        $lookup: {
          from: "users",
          localField: "assignedBy",
          foreignField: "_id",
          as: "assignedBy",
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1,
                email: 1,
                department: 1, // 👈 directly use existing department object
              },
            },
          ],
        },
      },
      { $unwind: { path: "$assignedBy", preserveNullAndEmptyArrays: true } },

      // assignedTo
      {
        $lookup: {
          from: "users",
          localField: "assignedTo",
          foreignField: "_id",
          as: "assignedTo",
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1,
                email: 1,
                department: 1, // 👈 this will now contain { _id, title, permission }
              },
            },
          ],
        },
      },
      { $unwind: { path: "$assignedTo", preserveNullAndEmptyArrays: true } },

      // Files
      {
        $addFields: {
          files: {
            $map: {
              input: { $ifNull: ["$files", []] },
              as: "f",
              in: {
                _id: "$$f._id",
                fileName: "$$f.fileName",
                fileType: "$$f.fileType",
                fileSize: "$$f.fileSize",
                uploadedBy: "$$f.uploadedBy",
                url: { $concat: ["/api/files/", { $toString: "$$f._id" }] },
              },
            },
          },
        },
      },

      {
        $project: {
          title: 1,
          description: 1,
          priority: 1,
          status: 1,
          createdAt: 1,
          assignedBy: 1,
          assignedTo: 1,
          files: 1,
        },
      },
    ]).allowDiskUse(true);

    return res.status(200).json({
      error: false,
      count: tasks.length,
      tasks,
    });

  } catch (error) {
    console.error("🔥 Error fetching tasks:", error);
    return res.status(500).json({
      error: true,
      message: "Server error while fetching tasks",
    });
  }
};




exports.uploadWork = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { taskId, link, userId } = req.body;
    const files = req.files || [];

    // First get the user who is submitting the work
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({
        message: 'User not found',
        details: { userId }
      });
    }

    // Validate required fields
    if (!taskId) {
      await session.abortTransaction();
      return res.status(400).json({
        message: 'Task ID is required',
        details: { missingField: 'taskId' }
      });
    }

    if (!files.length && !link) {
      await session.abortTransaction();
      return res.status(400).json({
        message: 'Either files or link must be provided',
        details: { missingFields: ['files', 'link'] }
      });
    }

    // Find the original task
    const originalTask = await Task.findOne({ _id: taskId, assignedTo: userId })
      .session(session);

    if (!originalTask) {
      await session.abortTransaction();
      return res.status(404).json({
        message: 'Task not found or not assigned to you',
        details: {
          providedIdentifier: taskId,
          assignedTo: userId
        }
      });
    }

    // Get the creator and assigner of the task
    const [taskCreator, assignedByUser] = await Promise.all([
      User.findById(originalTask.createdBy).session(session),
      originalTask.assignedBy ? User.findById(originalTask.assignedBy).session(session) : null
    ]);

    if (!taskCreator) {
      await session.abortTransaction();
      return res.status(404).json({
        message: 'Task creator not found',
        details: { createdBy: originalTask.createdBy }
      });
    }

    // Get viewers (assuming this comes from somewhere)
    const viewers = originalTask.viewers || [];

    // Create submission action
    const submissionAction = {
      action: 'Work Submitted',
      user: {
        id: user._id,
        username: user.username
      },
      date: new Date(),
      files: [],
      link: link || undefined
    };

    // Process files
    if (files.length > 0) {
      for (const file of files) {
        const fileRecord = {
          fileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          fileData: file.buffer,
          uploadedBy: user._id,
          viewers: viewers.map(v => v.toString())
        };

        originalTask.files.push(fileRecord);
        submissionAction.files.push({
          name: file.originalname,
          fileData: file.buffer,
          uploadedBy: user._id,
          fileType: file.mimetype,
          fileSize: file.size,
        });
      }
    }

    // Update original task
    originalTask.actions = originalTask.actions || [];
    originalTask.history.push(submissionAction);

    // Update user statistics
    user.pending = Math.max((user.pending || 0) - 1, 0);
    user.inProgress = (user.inProgress || 0) - 1;
    user.review = (user.review || 0) + 1;

    // Update task creator's review count
    taskCreator.review = (taskCreator.review || 0) + 1;

    // Update assignedBy user's review count if different from creator
    const usersToSave = [originalTask.save({ session }), user.save({ session }), taskCreator.save({ session })];
    if (assignedByUser && !assignedByUser._id.equals(taskCreator._id)) {
      assignedByUser.review = (assignedByUser.review || 0) + 1;
      usersToSave.push(assignedByUser.save({ session }));
    }

    // Save all updates within the same transaction
    await Promise.all(usersToSave);

    await session.commitTransaction();

    const response = {
      success: true,
      message: `Work uploaded successfully. 1 review tasks created and 1 related tasks updated.`,
      originalTaskId: originalTask._id,
      reviewTasksCreated: 1,
      relatedTasksUpdated: 1,
      filesUploaded: files.length,
      linkSubmitted: !!link,
      userStats: {
        pending: user.pending,
        inProgress: user.inProgress,
        review: user.review
      },
      creatorStats: {
        review: taskCreator.review
      }
    };

    // Add assignedBy stats to response if applicable
    if (assignedByUser && !assignedByUser._id.equals(taskCreator._id)) {
      response.assignedByStats = {
        review: assignedByUser.review
      };
    }

    res.status(200).json(response);

  } catch (err) {
    await session.abortTransaction();
    console.error('Upload error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during file upload',
      error: err.message
    });
  } finally {
    session.endSession();
  }
};
// Helper function for URL validation
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}


exports.getTasksByStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userRole = user.role?.toLowerCase();
    let filter = {};

    // ✅ HR → tasks created by HR
    if (userRole === 'hr') {
      filter = { assignedBy: user._id };

      // ✅ Manager → tasks assigned to manager
    } else if (userRole === 'manager') {
      filter = { assignedTo: user._id };

      // ✅ Employee → tasks assigned to employee
    } else {
      filter = { assignedTo: user._id };
    }

    // ✅ Status filter
    // "assigned" → show all tasks for this role
    if (status && status.toLowerCase() !== STATUS.ASSIGNED.toLowerCase()) {
      filter.status = status;
    }

    const tasks = await Task.find(filter)
      .populate('assignedBy', 'username email role')
      .populate('assignedTo', 'username email role');

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });

  } catch (err) {
    console.error('Error fetching tasks by role:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.approveTask = async (req, res) => {
  const { taskId } = req.body;
  const userId = req.user.id; // Logged-in HOD

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Ensure only the HOD assigned can approve
    if (task.assignedTo.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to approve this task' });
    }

    // Update status to active
    task.status = 'TODO'; // 👈 initial status after approval
    task.reviewstatus = 'approved';
    await task.save();

    // Notify employee
    const notif = new Notification({
      userId: task.assignedBy, // employee
      taskId: task._id,
      type: 'approval_granted',
      message: `Your task "${task.title}" has been approved by HOD`,
      read: false
    });
    await notif.save();

    res.json({ success: true, message: 'Task approved successfully', task });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ message: 'Server error approving task' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  const { status, taskId } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Authorization token is required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    // ✅ Get user who is updating
    const currentUser = await User.findById(userId).populate("department");
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = status;

    task.history.push({
      type: "update_status",
      status: status,
      user: currentUser,
      date: new Date(),
      action: `${currentUser.username} updated status to "${status}"`
    });

    await task.save();

    // ✅ Find SUB_ADMIN, MANAGER, SUPER_ADMIN users
    const adminUsers = await User.find({
      role: { $in: ["SUB_ADMIN", "MANAGER", "SUPER_ADMIN"] }
    }).select("_id");

    // ✅ Find HOD & SUPERVISOR from same department as current user
    const hodAndSupervisors = await User.find({
      "department._id": currentUser.department?._id,
      role: { $in: ["HOD", "SUPERVISOR"] }
    }).select("_id");

    // ✅ Merge all recipients
    const recipientIds = [
      ...adminUsers.map(u => u._id.toString()),
      ...hodAndSupervisors.map(u => u._id.toString())
    ];

    // ✅ Create Notification
    const notif = new Notification({
      userId: recipientIds, // multiple users
      taskId: task._id,
      type: "update_task_status",
      message: `${currentUser.username} updated task "${task.title}" status to "${status}"`,
      read: false
    });
    await notif.save();

    res.json({
      success: true,
      message: "Task status updated, history added, and notifications sent",
      task
    });

  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ message: "Server error updating task", error: error.message });
  }
};

exports.editTask = async (req, res) => {
  const { taskId, title, description, priority, deadline, } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Authorization token is required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    const userRole = decoded.role;

    // ✅ Find task with creator & department
    const task = await Task.findById(taskId)
      .populate("createdBy", "username department role")
      .populate("assignTo", "username department role");

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const taskDept = task.createdBy.department?.toString();

    // ✅ Allowed roles check
    const allowedRoles = ["MANAGER", "SUB_ADMIN", "SUPER_ADMIN"];
    const isCreator = task.createdBy._id.toString() === userId;
    const sameDeptHODorSupervisor =
      (userRole === "HOD" || userRole === "SUPERVISOR") &&
      decoded.department?.toString() === taskDept;

    const isHigherScope = allowedRoles.includes(userRole);

    if (!(isCreator || sameDeptHODorSupervisor || isHigherScope)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this task",
      });
    }

    // ✅ Update fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (priority) task.priority = priority;

    if (deadline) {
      const parsedDeadline = new Date(deadline);
      if (isNaN(parsedDeadline.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid deadline format" });
      }
      task.deadline = parsedDeadline;
    }

    // if (assignTo && Array.isArray(assignTo)) {
    //   // task.assignTo = assignTo;
    // }

    // ✅ History
    task.history.push({
      action: "Task Edited",
      user: { id: userId, username: decoded.username || "Unknown" },
      date: new Date(),
      type: "edited",
    });

    await task.save();

    // ✅ Notifications
    const notifyRoles = ["MANAGER", "SUB_ADMIN", "SUPER_ADMIN", "HOD"];
    const notifyUsers = await User.find({
      role: { $in: notifyRoles },
      _id: { $ne: userId }
    }).select("_id username role");

    await Promise.all(
      notifyUsers.map(user =>
        Notification.create({
          userId: user._id,
          taskId: task._id,
          type: "task_updated",
          message: `${decoded.username} updated task "${task.title}"`,
          read: false,
        })
      )
    );

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Edit task error:", error);
    res.status(500).json({
      success: false,
      message: "Server error editing task",
      error: error.message,
    });
  }
};
