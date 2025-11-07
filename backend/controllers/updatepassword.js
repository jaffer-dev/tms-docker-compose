const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.updateMemberPassword = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { password } = req.body;
  const { id } = req.params;

  if (!token) return res.status(401).json({ message: 'Authorization token required' });
  if (!password) return res.status(400).json({ message: 'Password is required' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters long' });

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    // Find user
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if new password is same as current password
    const isSame = await bcrypt.compare(password, user.password);
    if (isSame) return res.status(400).json({ message: 'New password cannot be same as the old password' });

    // Hash new password
    // const hashedPassword = await bcrypt.hash(password, 10);
    user.password = password;

    // **Skip role validation for SUPER_ADMIN or any restricted user**
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Password update error:', error);
    if (error.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid token' });
    if (error.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token expired' });
    return res.status(500).json({ message: 'Internal server error' });
  }
};
