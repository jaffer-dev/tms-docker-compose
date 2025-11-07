
const Approval = require('../models/Approvals')
const Task = require('../models/Task')
const jwt = require('jsonwebtoken');
const User = require('../models/User')
const Notification = require('../models/Notification')

const JWT_SECRET = process.env.JWT_SECRET;


// exports.getApprovals = async (req, res) => {
//     try {
//         const token = req.headers.authorization?.split(' ')[1];
//         if (!token) {
//             return res.status(401).json({ success: false, message: 'Authorization token is required' });
//         }

//         const decoded = jwt.verify(token, JWT_SECRET);
//         const userId = decoded.id;
//         // const { userId } = req.body; // middleware se decoded user ID


//         // Fetch approvals where user is approver (HOD) or requester
//         const approvals = await Approval.find({
//             $or: [{ requestedBy: userId }, { requestedTo: userId }]
//         })
//             .populate("requestedBy", "username role department")
//             .populate("requestedTo", "username role")
//             .populate("assignTo", "username role email department")
//             .sort({ createdAt: -1 });

//         res.status(200).json({
//             success: true,
//             count: approvals.length,
//             approvals
//         });
//     } catch (error) {
//         console.error("Error in getApprovals:", error);
//         res.status(500).json({ success: false, message: "Server error", error: error.message });
//     }
// }


exports.approveTaskRequest = async (req, res) => {
  const { approvalId, action } = req.body; // action = "APPROVE" | "REJECT"


  const user = req.user;
  const userId = user?._id;
  const userRole = user.role;

  try {
    const approval = await Approval.findById(approvalId)
      .populate("requestedBy requestedTo assignTo");
    if (!approval)
      return res.status(404).json({ message: "Approval not found" });

    // Get employee's HOD id (jis employee ne approval banayi)
    let employeeHODId = null;
    if (approval?.requestedBy?.department?._id) {
      const hod = await User.findOne({
        role: "HOD",
        "department._id": approval.requestedBy.department._id,
      }).select("_id");
      employeeHODId = hod?._id?.toString();
    }

    const allowedRoles = ["SUPER_ADMIN", "SUB_ADMIN", "MANAGER"];
    const isAllowed =
      allowedRoles.includes(userRole) ||
      String(approval.requestedTo._id) === userId ||
      (employeeHODId && employeeHODId === userId);

    if (!isAllowed) {
      return res
        .status(403)
        .json({ message: "You are not authorized to approve this request" });
    }

    if (action === "APPROVE") {
      approval.status = "APPROVED";
      await approval.save();

      const type = approval.type;
      const assignerUser = approval.requestedBy; // Employee
      const assignedUser = approval.assignTo;    // HOD from assignTo obj

      // Agar MEMO hai to HOD ke department ke sabhi members nikal lo
      let getHODTeamMembers =
        type === "MEMO"
          ? await User.find({
            _id: { $ne: assignedUser._id },
            "department._id": assignedUser.department?._id,
          }).select("_id")
          : [];
      const getHODTeamMembersId = getHODTeamMembers.map((user) => user._id);

      const actionType = () => {
        if (type === "MEMO") {
          return {
            action: `Assigned To ${assignedUser?.department?.title} department`,
            date: new Date(),
            type: "assigned",
          };
        }
        return {
          action: `Assigned to ${assignedUser.username}`,
          user: { id: assignerUser._id, username: assignerUser.username },
          assignedTo: { id: assignedUser._id, username: assignedUser.username },
          date: new Date(),
          type: "assigned",
        };
      };

      await Task.create({
        title: approval.title,
        description: approval.description,
        type,
        priority: approval.priority || "LOW",
        deadline: approval.deadline,
        status: "TODO",
        assignedBy: assignerUser,
        assignedTo: [assignedUser?._id, ...getHODTeamMembersId],
        createdBy: assignerUser._id,
        history: [
          {
            action: "Task Created after approval",
            user: { id: assignedUser._id, username: assignedUser.username },
            date: new Date(),
            type: "created",
          },
          actionType(),
        ],
      });

      const notification = new Notification({
        userId: [assignedUser?._id, ...getHODTeamMembersId],
        type: "approval_request",
        message: `${assignerUser.username} requested approval for task "${approval.title}"`,
        read: false,
      });
      await notification.save();

      return res.status(200).json({
        success: true,
        message: "Task approved and created successfully",
      });
    }

    if (action === "REJECT") {
      approval.status = "REJECTED";
      await approval.save();
      return res.status(200).json({
        success: true,
        message: "Task request rejected",
        approval,
      });
    }

    return res.status(400).json({ message: "Invalid action" });
  } catch (error) {
    console.error("Error in approveTaskRequest:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getApprovals = async (req, res) => {
  try {
    const userData = req.user;
    const userId = userData._id;

    console.log(userData, userId)

    const user = await User.findById(userId).populate("department");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let query = {};

    if (["SUPER_ADMIN", "SUB_ADMIN", "MANAGER"].includes(user.role)) {
      query = {};
    }
    else if (["HOD", "SUPERVISOR"].includes(user.role)) {
      // apne department ke sabhi members ki approvals
      const departmentId = user.department?._id || user.department;
      const deptMembers = await User.find({ "department._id": departmentId }).select("_id");
      const memberIds = deptMembers.map(m => m._id.toString());

      query = {
        $or: [
          { requestedBy: { $in: memberIds } },
          { requestedTo: { $in: memberIds } }
        ]
      };
    }
    else if (user.role === "EMPLOYEE") {
      query = { requestedBy: userId };
    }
    else {
      // fallback: user ke related approvals
      query = {
        $or: [{ requestedBy: userId }, { requestedTo: userId }]
      };
    }

    const approvals = await Approval.find(query)
      .populate("requestedBy", "username role department")
      .populate("requestedTo", "username role")
      .populate("assignTo", "username role email department")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: approvals.length,
      approvals
    });
  } catch (error) {
    console.error("Error in getApprovals:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

