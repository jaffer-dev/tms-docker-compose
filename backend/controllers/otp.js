const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator')

exports.resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(user)
    // Generate new OTP
    const otp = otpGenerator.generate(6, {
      digits: true,      
      alphabets: false, 
      upperCase: false,   
      specialChars: false
    });
    console.log(otp)

    // Update user with new OTP
    user.otp = otp;
    user.otpExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    // Send new OTP email
    await sendEmail(email, 'Your New Verification Code', {
      type: 'resendOtp',
      otp: `${otp}`,
    });

    res.json({ message: "New OTP sent successfully" });

  } catch (err) {
    console.error(err);

    res.status(500).json({ error: true, message: "Server error while resending OTP" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, userId, otp } = req.body;

  try {
    // Validate required fields
    if (!email || !userId || !otp) {
      return res.status(400).json({
        message: "Email, userId and OTP are required",
        received: req.body // For debugging
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: "OTP must be 6 digits" });
    }

    // Find user by ID and email
    const user = await User.findOne({
      _id: userId,
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check OTP
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Mark as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Create real auth token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: "Account verified successfully",
      token,
      username: user.username,
      email: user.email,
      role: user.role,
      userId: user._id
    });

  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({
      message: "Server error during OTP verification",
      error: err.message
    });
  }
};