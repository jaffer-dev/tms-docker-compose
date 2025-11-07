const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Team = require('../models/Team')
const Task = require('../models/Task')

const mongoose = require('mongoose');
const LeaveBalance = require('../models/LeaveBalance');
const UserPersonalDetails = require('../models/UserPersonalDetails');
const JWT_SECRET = process.env.JWT_SECRET

// get HOD's and employees on role based
exports.getAllEmployees = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token is required',
      code: 'MISSING_AUTH_TOKEN'
    });
  }

  try {
    // 🔹 Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const requestingUser = await User.findById(decoded.id).lean();

    if (!requestingUser) {
      return res.status(404).json({
        success: false,
        message: 'Requesting user not found',
        code: 'USER_NOT_FOUND'
      });
    }

    let query = {};

    // 🔹 Role-based access
    if (['SUPER_ADMIN', 'SUB_ADMIN', 'MANAGER'].includes(requestingUser.role)) {
      // ✅ Fetch ALL employees (exclude HR/admin roles)
      query.role = { $nin: ['HR', 'MANAGER', 'SUPER_ADMIN', 'SUB_ADMIN'] };
    } else if (['HOD', 'SUPERVISOR'].includes(requestingUser.role)) {
      // ✅ Fetch ONLY from same department/team
      if (!requestingUser.department?._id) {
        return res.status(400).json({
          success: false,
          message: 'User has no department assigned',
          code: 'NO_DEPARTMENT'
        });
      }
      query = {
        role: { $nin: ['HR', 'MANAGER', 'SUPER_ADMIN', 'SUB_ADMIN'] },
        'department._id': requestingUser.department._id
      };
    } else {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to fetch employees',
        code: 'UNAUTHORIZED_ROLE'
      });
    }

    // 🔹 Fetch employees with selected fields
    const employees = await User.find(query)
      .select('username _id role email department isActive isFirstLogin')
      .lean();

    return res.status(200).json({
      success: true,
      count: employees.length,
      users: employees
    });

  } catch (error) {
    console.error('Error fetching employees:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token', code: 'INVALID_TOKEN' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid data format', code: 'DATA_FORMAT_ERROR' });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching employees',
      code: 'SERVER_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// get users excluding employees
exports.getHrUsers = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Get JWT token

  if (!token) {
    return res.status(404).json({
      success: false,
      message: 'Authorization token is required'
    });
  }

  try {
    // Verify token and get user info
    const decoded = jwt.decode(token);

    // Get HR users (only username and email)
    const hrUsers = await User.find({ role: 'HR' })
      .select('username email')  // Only these two fields
      .lean();  // Convert to plain JS objects

    return res.status(200).json({
      success: true,
      count: hrUsers.length,
      hrUsers
    });

  } catch (error) {
    console.error('Error fetching HR users:', error);

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching HR users'
    });
  }
};

// get all managers not in this not 
exports.getManagers = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Get JWT token

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token is required',
      code: 'MISSING_AUTH_TOKEN'
    });
  }

  try {
    // Verify token
    const decoded = jwt.decode(token);

    // Get managers with only the specified fields
    const managers = await User.find({ role: 'manager' })
      .select('username _id role email')
      .lean();

    if (!managers.length) {
      return res.status(200).json({
        success: true,
        message: 'No managers found',
        count: 0
      });
    }

    return res.status(200).json({
      success: true,
      count: managers.length,
      managers
    });

  } catch (error) {
    console.error('Error fetching managers:', error);

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching managers',
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
};

// get userBy Id for 
exports.getUserById = async (req, res) => {
  try {
    const token = req?.headers?.authorization?.split(' ')[1];
    const decodedToken = jwt.decode(token)

    if (!mongoose.Types.ObjectId.isValid(decodedToken?.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
        receivedId: decodedToken?.id
      });
    }

    const user = await User.findById(decodedToken?.id).lean();
    const leaveBalance = await LeaveBalance.findOne({ userId: decodedToken?.id }).lean();
    const personalDetails = await UserPersonalDetails.findOne({ userId: decodedToken?.id }).lean();

    // const { annual, casual, sick, ...leaves } = leaveBalance
   

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({ error: false, user: { ...user, leaveBalance, personalDetails } });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Server error',
      error: error.message
    });
  }
};

// search user and not working on FE
exports.searchUsers = async (req, res) => {
  const { query } = req.query;

  try {
    const users = await User.find({
      username: { $regex: query, $options: 'i' }, // case-insensitive search
      role: { $ne: 'HR' } // optional filter if needed
    }).select('username email _id');

    res.json(users,);
  } catch (err) {
    console.error('Error searching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// deleting user from db
exports.deleteUserById = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const userIdToDelete = req.params.id;

  if (!token) {
    return res.status(401).json({
      message: 'Authorization token is required',
      code: 'MISSING_AUTH_TOKEN'
    });
  }

  try {
    // ⚡ Better: use verify instead of decode for security
    const decoded = jwt.verify(token, JWT_SECRET);
    const requestingUserId = decoded.id;

    const requestingUser = await User.findById(requestingUserId);

    if (!requestingUser || ['HR', 'HOD', 'EMPLOYEE', 'SUPERVISOR'].includes(requestingUser.role)) {
      return res.status(403).json({
        message: 'Only Super Admin and manager users can delete other users',
        code: 'UNAUTHORIZED_ACTION'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userIdToDelete)) {
      return res.status(400).json({
        message: 'Invalid ID format',
        details: `The ID ${userIdToDelete} is not a valid MongoDB ObjectId`,
        code: 'INVALID_ID_FORMAT'
      });
    }

    const objectIdToDelete = new mongoose.Types.ObjectId(userIdToDelete);

    if (requestingUserId === userIdToDelete) {
      return res.status(400).json({
        message: 'Cannot delete your own account',
        code: 'SELF_DELETION_ATTEMPT'
      });
    }

    // Step 1: Delete the user
    const deletedUser = await User.findByIdAndDelete(objectIdToDelete);
    if (!deletedUser) {
      return res.status(404).json({
        message: 'User not found',
        attemptedId: userIdToDelete,
        code: 'USER_NOT_FOUND'
      });
    }

    // Step 2: Remove user from all teams + clear HOD/SUPERVISOR if applicable
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Remove from members
      await Team.updateMany(
        { 'members.user': objectIdToDelete },
        { $pull: { members: { user: objectIdToDelete } } },
        { session }
      );

      // ⚡ Extra step: If user was HOD or Supervisor → clear team fields
      await Team.updateMany(
        { $or: [{ hodId: objectIdToDelete }, { supervisorId: objectIdToDelete }] },
        { $unset: { hodId: "", supervisorId: "" } }, // unset whichever matches
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        message: 'User deleted successfully',
        deletedUserId: userIdToDelete,
        teamsUpdated: true
      });

    } catch (transactionError) {
      await session.abortTransaction();
      session.endSession();
      throw transactionError;
    }

  } catch (error) {
    console.error('Delete error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    return res.status(500).json({
      message: 'Server error during deletion',
      error: error.message,
      code: 'SERVER_ERROR'
    });
  }
};

// update user status for 
exports.updateUserStatus = async (req, res) => {
  try {
    const { id, isActive } = req.body;

    if (!id || typeof isActive !== "boolean") {
      return res.status(400).json({ message: "id aur isActive (true/false) required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: `User status updated successfully`,
      // user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// get user task stats on rule based
exports.getStats = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authorization token is required",
      code: "MISSING_AUTH_TOKEN",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    const userRole = decoded.role;

    // Find current user with department
    const currentUser = await User.findById(userId).populate("department");
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    let matchCondition = {};

    // 1️⃣ Employee → only their tasks
    if (userRole === "EMPLOYEE") {
      matchCondition = { assignedTo: { $in: [new mongoose.Types.ObjectId(userId)] } };
    }

    // 2️⃣ HOD / SUPERVISOR → all tasks of department members
    else if (["HOD", "SUPERVISOR"].includes(userRole)) {
      const deptUsers = await User.find({
        "department._id": currentUser.department?._id,
      }).select("_id");

      const deptUserIds = deptUsers.map((u) => u._id);
      matchCondition = { assignedTo: { $in: deptUserIds } };
    }

    // 3️⃣ Manager / Super_Admin / Sub_Admin → all tasks
    else if (["MANAGER", "SUPER_ADMIN", "SUB_ADMIN"].includes(userRole)) {
      matchCondition = {}; // No filter → all tasks
    }

    // STATUS-WISE COUNT (Overall)
    const taskCounts = await Task.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statsObj = {
      total: 0,
      TODO: 0,
      IN_PROGRESS: 0,
      REVIEW: 0,
      COMPLETED: 0,
      PENDING: 0,
    };

    taskCounts.forEach((t) => {
      statsObj[t._id] = t.count;
      statsObj.total += t.count;
    });

    // MONTHLY CHART (Month + Status wise)
    const monthlyTasks = await Task.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthlyStatsMap = {};
    monthlyTasks.forEach((item) => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
      if (!monthlyStatsMap[key]) {
        monthlyStatsMap[key] = {
          month: key,
          TODO: 0,
          IN_PROGRESS: 0,
          REVIEW: 0,
          COMPLETED: 0,
          PENDING: 0,
          total: 0,
        };
      }
      monthlyStatsMap[key][item._id.status] = item.count;
      monthlyStatsMap[key].total += item.count;
    });

    const monthlyStats = Object.values(monthlyStatsMap);

    return res.status(200).json({
      success: true,
      stats: {
        username: currentUser.username,
        role: userRole,
        ...statsObj,
        monthlyTasks: monthlyStats,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching stats",
      code: "SERVER_ERROR",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
