const Team = require('../models/Team');
const User = require('../models/User');
const mongoose = require('mongoose');

// Search team members by query and currentUserId
exports.searchTeamMembers = async (req, res) => {
  try {
    const { query, currentUserId } = req.query;

    // Validate required parameters
    if (!query || !currentUserId) {
      return res.status(400).json({ 
        message: 'Both query and currentUserId parameters are required'
      });
    }

    // Validate currentUserId format
    if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res.status(400).json({ message: 'Invalid currentUserId format' });
    }

    // Find teams where current user is a member
    const teams = await Team.find({
      'members.user': currentUserId
    });

    // Get unique member IDs
    const teamMemberIds = [...new Set(
      teams.flatMap(team => 
        team.members.map(member => member.user.toString())
      )
    )];

    // Search users in these teams
    const users = await User.find({
      $and: [
        { 
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        },
        { _id: { $in: teamMemberIds } }
      ]
    }).select('username email _id');

    res.status(200).json(users);
  } catch (err) {
    console.error('Error searching team members:', err);
    res.status(500).json({ 
      message: 'Server error while searching team members',
      error: err.message 
    });
  }
};