const User = require('../models/User');
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
const { authorizeRoles } = require('../middleware/authenticate');

exports.getMembers = async (req, res) => {
  try {

    const token = req
    const users = await User.find({
      role: { $in: ["MANAGER", "HR", "SUB_ADMIN"] }
    }).select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      members: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
};