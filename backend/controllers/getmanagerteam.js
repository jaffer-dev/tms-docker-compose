const mongoose = require('mongoose');
const Team = require('../models/Team');
const jwt = require('jsonwebtoken');


exports.getUserTeamMembers = async (req, res) => {
  try {

    const token = req.headers.authorization?.split(' ')[1];

    const decoded = jwt.decode(token);
    const userId = decoded.id;


    // Enhanced validation
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'User ID is required and must be a string'
      });
    }

    // Check if ID is valid MongoDB ObjectId
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format - must be 24-character hex string'
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find all teams where user is a member
    const teams = await Team.find({
      "members.user": userObjectId
    })
      .populate({
        path: 'members.user',
        select: 'username email role'
      })
      .lean();

    if (!teams || teams.length === 0) {
      return res.status(200).json({
        success: true,
        members: [],
        message: 'User is not part of any team'
      });
    }

    // Extract and format members data, filtering for only employees
    const members = teams.flatMap(team => 
      team.members
        .filter(member =>
          member.user &&
          member.user._id.toString() !== userId &&
          member.user.role?.toLowerCase() === 'employee' // Only include employees
        )
        .map(member => ({
          _id: member.user._id,
          username: member.name || member.user.username,
          email: member.email || member.user.email,
          department: member.department,
          permission: member.permission,
          teamId: team._id,
          teamTitle: team.title,
          role: member.user.role
        }))
    );

    // Remove duplicates (in case user is in multiple teams)
    const uniqueMembers = [...new Map(members.map(member =>
      [member._id.toString(), member])).values()];

    return res.status(200).json({
      success: true,
      members: uniqueMembers,
      totalTeams: teams.length
    });

  } catch (err) {
    console.error('Error in getUserTeamMembers:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};