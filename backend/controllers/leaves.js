const Leave = require('../models/Leave');
const LeaveBalance = require('../models/LeaveBalance');
const User = require('../models/User');
const { inclusiveDays } = require('../utils/date');

const WFH_CUTOFF_HOUR = 11; // 12:00 PM server time
const NOTICE_10_DAYS = 10;
const NOTICE_15_DAYS = 15;

exports.applyLeave = async (req, res) => {
  const userId = req.user.id;
  const { category, fromDate, toDate, reason } = req.body;

  try {
    const days = inclusiveDays(fromDate, toDate);
    const today = new Date();
    const start = new Date(fromDate);

    // ---------------------------
    // 🕒 1. WFH SAME-DAY TIME CUTOFF (before 11:00 AM)
    // ---------------------------
    if (category === 'WFH' && start.toDateString() === today.toDateString()) {
      const cutoff = new Date();
      cutoff.setHours(11, 0, 0, 0); // 11 AM cutoff
      if (new Date() > cutoff) {
        return res.status(400).json({
          message: 'WFH for today must be applied before 11:00 AM.',
        });
      }
    }

    // ---------------------------
    // 📅 2. WFH LIMIT: 1 per week
    // ---------------------------
    if (category === 'WFH') {
      const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });     // Sunday

      const alreadyWFH = await Leave.findOne({
        userId,
        category: 'WFH',
        fromDate: { $gte: weekStart, $lte: weekEnd },
      });

      if (alreadyWFH) {
        return res.status(400).json({
          message: 'You can only apply for one WFH per week.',
        });
      }
    }

    // ---------------------------
    // 📑 3. File upload handling (if provided)
    // ---------------------------
    let fileMeta = {};
    if (req.file) {
      const filePath = `/uploads/leaves/${req.file.filename}`;
      fileMeta = {
        originalName: req.file.originalname,
        filePath,
        mimeType: req.file.mimetype,
        size: req.file.size,
      };
    }

    // ---------------------------
    // 🏖️ 4. Leave Balance (for non-WFH)
    // ---------------------------
    if (category !== 'WFH') {
      const balance = await LeaveBalance.findOne({ userId });
      const key = category.toLowerCase();
      if (!balance || balance[key] < days) {
        return res.status(400).json({ message: 'Not enough leave balance.' });
      }
    }

    // ---------------------------
    // ⛔ 5. Overlap Check
    // ---------------------------
    const overlapping = await Leave.findOne({
      userId,
      $or: [
        { fromDate: { $lte: toDate }, toDate: { $gte: fromDate } }
      ],
      status: { $in: ['PENDING', 'APPROVED'] },
    });

    if (overlapping) {
      return res.status(400).json({ message: 'Overlapping leave exists.' });
    }

    // ---------------------------
    // ✅ 6. Create Leave Entry
    // ---------------------------
    const leave = await Leave.create({
      userId,
      category,
      fromDate,
      toDate,
      days,
      reason,
      meta: fileMeta,
    });

    return res.status(201).json({
      success: true,
      message: 'Leave applied successfully.',
      leave,
    });

  } catch (err) {
    console.error('Error applying leave:', err);
    return res.status(500).json({ message: err.message });
  }
};


exports.updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body; // APPROVED or REJECTED
    const approverId = req.user.id;

    // 🔹 Fetch leave details
    const leave = await Leave.findById(leaveId);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });

    // 🔹 Fetch approver and requester
    const approver = await User.findById(approverId).populate('department');
    const requester = await User.findById(leave.userId).populate('department');

    if (!approver || !requester)
      return res.status(404).json({ message: 'User not found' });

    // 🔹 Check if approver is authorized
    const canApprove =
      ['SUPER_ADMIN', 'SUB_ADMIN', 'MANAGER'].includes(approver.role) ||
      (['HOD', 'SUPERVISOR'].includes(approver.role) &&
        approver.department?._id?.equals(requester.department?._id));

    if (!canApprove) {
      return res
        .status(403)
        .json({ message: 'Not authorized to approve or reject this leave.' });
    }

    // 🔹 Update leave status
    leave.status = status;
    leave.approvedBy = approverId;
    leave.approvedAt = new Date();
    await leave.save();

    // 🔹 If approved, deduct leave balance
    if (status === 'APPROVED' && leave.category !== 'WFH') {
      const balance = await LeaveBalance.findOne({ userId: leave.userId });
      if (!balance)
        return res
          .status(404)
          .json({ message: 'Leave balance not found for this user' });

      const key = leave.category.toLowerCase();
      if (balance[key] < leave.days) {
        return res
          .status(400)
          .json({ message: 'Insufficient balance to approve this leave' });
      }

      balance[key] -= leave.days;
      balance.total -= leave.days;
      balance.updatedAt = new Date();
      await balance.save();

      // 🔹 Optional: mark attendance for leave period
      // (future enhancement — e.g., Attendance.create({ date, userId, status: 'ON_LEAVE' }))
    }

    // 🔹 Send success response
    return res.json({
      success: true,
      message: `Leave ${status.toLowerCase()} successfully.`,
      leave,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

exports.fetchApprovals = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('department');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { role, department } = user;

    let filter = {};

    //  Normal employee  can see only their own leave requests
    if (role === 'EMPLOYEE' || role === 'MEMBER') {
      filter = { userId: user._id };

    //  Department HOD or Supervisor can see leaves of their department
    } else if (role === 'HOD' || role === 'SUPERVISOR') {
      filter = { department: department?._id };

    //  Super Admin / Sub Admin / Manager can see all leaves
    } else if (['SUPER_ADMIN', 'SUB_ADMIN', 'MANAGER'].includes(role)) {
      filter = {}; // no restriction
    }

    const leaves = await Leave.find(filter)
      .populate('userId', 'username email department')
      .populate('approvedBy', 'username role')
      .sort({ createdAt: -1 });

    return res.json({ success: true, leaves });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};