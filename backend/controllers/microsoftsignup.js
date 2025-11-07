const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const { decodeWithoutVerify } = require('../utils/tokenUtils');
const jwt = require('jsonwebtoken');

exports.microsoftLogin = async (req, res) => {
  const { idToken, role } = req.body;
  const decoded = decodeWithoutVerify(idToken);
  const email = decoded?.email || decoded?.preferred_username;
  const name = decoded?.name || email;

  if (!email) return res.status(400).json({ message: 'Invalid ID token: email missing' });

  try {
    let user = await User.findOne({ email });

    if (user) {
      
      return res.status(404).json({ message: 'User already exists' });
    }

    if (!role) return res.status(400).json({ message: 'Role is required for new Microsoft users' });

    user = new User({ 
      username: name, 
      email, 
      password: '', 
      role,
      monthlyTasks: {
        January: 0, February: 0, March: 0, April: 0, May: 0,
        June: 0, July: 0, August: 0, September: 0,
        October: 0, November: 0, December: 0
      }
    });
    await user.save();

    await sendEmail(email, 'Microsoft Signup Successful', `Welcome ${name}, your account was created.`);

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: "Microsoft signup successful",
      token,
      username: user.username,
      email: user.email,
      role: user.role,
      userId: user._id
    });

  } catch (err) {
    console.error('Microsoft signup error:', err);
    res.status(500).json({ message: 'Server error during Microsoft signup' });
  }
};