const { startOfWeek, endOfWeek, differenceInCalendarDays } = require('date-fns');
const Leave = require('../models/Leave');
const LeaveBalance = require('../models/LeaveBalance');
const User = require('../models/User');
const { inclusiveDays } = require('../utils/date');

const WFH_CUTOFF_HOUR = 11; // 11:00 PM server time


exports.applyLeave = async (req, res) => {
  const userId = req.user.id;
  let { category, fromDate, toDate, reason } = req.body;

  try {
    const user = await User.findById(userId).populate('department');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Convert dates properly
    const start = new Date(fromDate);
    const end = new Date(toDate || fromDate); // fallback if only one date provided
    const today = new Date();
    const days = differenceInCalendarDays(end, start) + 1;

    // ---------------------------------------------------
    // 📁 File Upload (optional)
    // ---------------------------------------------------
    let fileMeta = {};
    if (req.file) {
      fileMeta = {
        originalName: req.file.originalname,
        filePath: `/uploads/leaves/${req.file.filename}`,
        mimeType: req.file.mimetype,
        size: req.file.size,
      };
    }

    // ---------------------------------------------------
    // 🧭 SINGLE-DAY LEAVES (WFH, CASUAL)
    // ---------------------------------------------------
    if (['WFH', 'CASUAL'].includes(category)) {
      // ⛔ Throw error if more than 1 day selected
      if (days > 1) {
        return res.status(400).json({
          error: true,   message: `${category} leave can only be applied for one day.`,
        });
      }

      // Force same date for DB consistency
      toDate = fromDate;
    }

    // ---------------------------------------------------
    // 🚫 Overlapping Leave Check
    // ---------------------------------------------------
    const overlap = await Leave.findOne({
      userId,
      $or: [{ fromDate: { $lte: toDate }, toDate: { $gte: fromDate } }],
      status: { $in: ['PENDING_HOD', 'PENDING_SUPER_ADMIN', 'PENDING_HR', 'APPROVED'] },
    });

    if (overlap) {
      return res.status(400).json({  error: true,  message: 'Overlapping leave already exists.' });
    }

    // ---------------------------------------------------
    // 🏠 WFH RULES
    // ---------------------------------------------------
    if (category === 'WFH') {
      // ✅ Must be applied before 11:00 AM for same-day
      if (start.toDateString() === today.toDateString()) {
        const cutoff = new Date();
        cutoff.setHours(WFH_CUTOFF_HOUR, 0, 0, 0);
        if (new Date() > cutoff) {
          return res.status(400).json({
            error: true, message: 'WFH for today must be applied before 11:00 AM.',
          });
        }
      }

      // ✅ Only 1 WFH allowed per week
      const weekStart = startOfWeek(start, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(start, { weekStartsOn: 0 });

      const existingWFH = await Leave.findOne({
        userId,
        category: 'WFH',
        fromDate: { $gte: weekStart, $lte: weekEnd },
      });

      if (existingWFH) {
        return res.status(400).json({
          error: true, message: 'Only one WFH is allowed per week (Sunday to Saturday).',
        });
      }
    }

    // ---------------------------------------------------
    // 📅 ANNUAL LEAVE RULE
    // ---------------------------------------------------
    if (category === 'ANNUAL') {
      const diff = differenceInCalendarDays(start, today);
      if (diff < 30) {
        return res.status(400).json({
          error: true, message: 'Annual leave must be applied at least 30 days in advance.',
        });
      }
    }

    // ---------------------------------------------------
    // 💼 CASUAL LEAVE RULE (in addition to single-day)
    // ---------------------------------------------------
    if (category === 'CASUAL') {
      const existingCasual = await Leave.findOne({
        userId,
        category: 'CASUAL',
        status: { $in: ['PENDING_HOD', 'PENDING_SUPER_ADMIN', 'PENDING_HR', 'APPROVED'] },
      });

      if (existingCasual) {
        return res.status(400).json({
          error: true, message: 'Only one casual leave can be taken at a time.',
        });
      }
    }

    // ---------------------------------------------------
    // 🤒 SICK LEAVE RULE
    // ---------------------------------------------------
    if (category === 'SICK' && days > 2) {
      // ✅ Require medical certificate
      if (!req.file) {
        return res.status(400).json({
          error: true, message: 'Medical certificate is required for sick leave longer than 2 days.',
        });
      }

      // ✅ Deduct from Annual Leave if longer than 2 days
      const balance = await LeaveBalance.findOne({ userId });
      if (!balance || balance.remaining.annual < days) {
        return res.status(400).json({
          error: true, message: 'Not enough annual leave balance for long sick leave.',
        });
      }

      balance.remaining.annual -= days;
      balance.totalLeaves -= days;
      await balance.save();
    }

    // ---------------------------------------------------
    // 💰 Leave Balance Validation (Non-WFH)
    // ---------------------------------------------------
    if (category !== 'WFH') {
      const balance = await LeaveBalance.findOne({ userId });
      const key = category.toLowerCase();

      if (!balance || balance.remaining[key] < days) {
        return res.status(400).json({
          error: true, message: `Not enough ${category} leave balance.`,
        });
      }
    }

    // ---------------------------------------------------
    // 🔄 Initial Status Logic
    // ---------------------------------------------------
    let initialStatus = 'PENDING_HOD';
    if (user.role === 'HOD') {
      initialStatus = 'PENDING_SUPER_ADMIN';
    }

    // ---------------------------------------------------
    // ✅ Create Leave Entry
    // ---------------------------------------------------
    const leave = await Leave.create({
      userId,
      category,
      fromDate,
      toDate,
      days,
      reason,
      status: initialStatus,
      meta: fileMeta,
    });

    return res.status(201).json({
      error: false,
      message: 'Leave applied successfully.',
      leave,
    });

  } catch (err) {
    console.error('Error applying leave:', err);
    return res.status(500).json({ error: true, message: err.message });
  }
};


// exports.fetchApprovals = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).populate('department');
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const { role, department } = user;
//     let filter = {};

//     switch (role) {
//       case 'EMPLOYEE':
//       case 'MEMBER':
//         // Show only user's own leaves
//         filter = { userId: user._id };
//         break;

//       case 'HOD':
//       case 'SUPERVISOR':
//         // Show department leaves pending HOD approval
//         filter = { status: 'PENDING_HOD', department: department?._id };
//         break;

//       case 'SUPER_ADMIN':
//         // Show leaves pending SUPER_ADMIN approval
//         filter = { status: 'PENDING_SUPER_ADMIN' };
//         break;

//       case 'SUB_ADMIN':
//       case 'HR':
//       case 'MANAGER':
//         // HR/SubAdmin/Manager can see all
//         filter = {};
//         break;

//       default:
//         filter = { userId: user._id };
//     }

//     const leaves = await Leave.find(filter)
//       .populate('userId', 'username email role department')
//       .populate('approvedBy', 'username role')
//       .sort({ createdAt: -1 });

//     res.json({ success: true, leaves });
//   } catch (err) {
//     console.error('Error fetching approvals:', err);
//     return res.status(500).json({ message: err.message });
//   }
// };

exports.updateLeaveStatus = async (req, res) => {
  const { leaveId } = req.params;
  const { status, remarks } = req.body;
  const approverId = req.user.id;

  try {
    const leave = await Leave.findById(leaveId).populate('userId');
    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    const approver = await User.findById(approverId).populate('department');
    const requester = leave.userId;

    // ---------------------------
    // 🎯 Approval Logic
    // ---------------------------
    if (approver.role === 'HOD') {
      // HOD approval
      leave.hodApproval = {
        by: approverId,
        at: new Date(),
        status,
        remarks, // ✅ Save remarks
      };
      leave.status = status === 'APPROVED' ? 'PENDING_HR' : 'REJECTED';
    } 
    else if (approver.role === 'SUPER_ADMIN') {
      // SUPER_ADMIN approval
      leave.superAdminApproval = {
        by: approverId,
        at: new Date(),
        status,
        remarks, // ✅ Save remarks
      };
      leave.status = status === 'APPROVED' ? 'PENDING_HR' : 'REJECTED';
    } 
    else if (['SUB_ADMIN', 'HR', 'MANAGER'].includes(approver.role)) {
      // HR / SUB_ADMIN / MANAGER final approval
      leave.hrApproval = {
        by: approverId,
        at: new Date(),
        status,
        remarks, // ✅ Save remarks
      };
      leave.status = status === 'APPROVED' ? 'APPROVED' : 'REJECTED';

      // ✅ Deduct leave balance only after HR approval
      if (status === 'APPROVED' && leave.category !== 'WFH') {
        const balance = await LeaveBalance.findOne({ userId: leave.userId });
        if (!balance) {
          return res.status(404).json({ message: 'Leave balance not found' });
        }

        const key = leave.category.toLowerCase();
        if (balance.remaining[key] < leave.days) {
          return res.status(400).json({ message: 'Insufficient balance' });
        }

        balance.remaining[key] -= leave.days;
        balance.totalLeaves -= leave.days;
        balance.taken[key] += leave.days;
        balance.lastUpdated = new Date();
        await balance.save();
      }
    } 
    else {
      return res.status(403).json({ message: 'Not authorized to approve this leave.' });
    }

    await leave.save();

    res.json({
      success: true,
      message: `Leave ${status.toLowerCase()} successfully.`,
      leave,
    });
  } catch (err) {
    console.error('Error updating leave:', err);
    return res.status(500).json({ message: err.message });
  }
};


exports.fetchApprovals = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('department');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { role, department } = user;
    let filter = {};

    // ----------------------------
    // 🎯 Filter based on role
    // ----------------------------
    switch (role) {
      case 'EMPLOYEE':
      // case 'MEMBER':
        // Show only user's own leaves
        filter = { userId: user._id };
        break;

      case 'HOD':
      case 'SUPERVISOR':
        // Show department leaves pending HOD approval
        filter = { status: 'PENDING_HOD', department: department?._id };
        break;

      case 'SUPER_ADMIN':
        // Show leaves pending SUPER_ADMIN approval
        filter = { status: 'PENDING_SUPER_ADMIN' };
        break;

      case 'SUB_ADMIN':
      case 'HR':
      case 'MANAGER':
        // HR/SubAdmin/Manager can see all pending or completed
        filter = {};
        break;

      default:
        filter = { userId: user._id };
    }

    // ----------------------------
    // 🧩 Fetch leaves with full tracking info
    // ----------------------------
    const leaves = await Leave.find(filter)
      .populate('userId', 'username email role department')
      .populate('hodApproval.by', 'username email role')
      .populate('superAdminApproval.by', 'username email role')
      .populate('hrApproval.by', 'username email role')
      .sort({ createdAt: -1 });

    // ----------------------------
    // 🧾 Prepare response with tracking details
    // ----------------------------
    const detailedLeaves = leaves.map((leave) => ({
      _id: leave._id,
      employee: leave.userId?.username,
      role: leave.userId?.role,
      department: leave.userId?.department,
      category: leave.category,
      reason: leave.reason,
      fromDate: leave.fromDate,
      toDate: leave.toDate,
      days: leave.days,
      status: leave.status,
      createdAt: leave.createdAt,
      updatedAt: leave.updatedAt,

      tracking: [
        {
          stage: 'HOD Approval',
          by: leave.hodApproval?.by?.username || '-',
          role: leave.hodApproval?.by?.role || '-',
          status: leave.hodApproval?.status || '-',
          remarks: leave.hodApproval?.remarks || '-',
          date: leave.hodApproval?.at || '-',
        },
        {
          stage: 'Super Admin Approval',
          by: leave.superAdminApproval?.by?.username || '-',
          role: leave.superAdminApproval?.by?.role || '-',
          status: leave.superAdminApproval?.status || '-',
          remarks: leave.superAdminApproval?.remarks || '-',
          date: leave.superAdminApproval?.at || '-',
        },
        {
          stage: 'HR/Final Approval',
          by: leave.hrApproval?.by?.username || '-',
          role: leave.hrApproval?.by?.role || '-',
          status: leave.hrApproval?.status || '-',
          remarks: leave.hrApproval?.remarks || '-',
          date: leave.hrApproval?.at || '-',
        },
      ],
    }));

    res.json({
      success: true,
      count: detailedLeaves.length,
      leaves: detailedLeaves,
    });
  } catch (err) {
    console.error('Error fetching approvals:', err);
    return res.status(500).json({ message: err.message });
  }
};
