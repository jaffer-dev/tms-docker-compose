const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/emailService');
const bcrypt = require('bcryptjs');


const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Temporary storage for password reset OTPs (use Redis in production)
const passwordResetOTPs = new Map();

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'No account found with this email' 
      });
    }

    if (!user.isActive) {
      const errMessage = !user.isActive ? 'Your account is inactive. Please contact admin' : 'Your account is inactive. Please contact admin' 
      return res.status(404).json({ 
        success: false,
        message: errMessage 
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 600000; // 10 minutes

    // Store OTP temporarily
    passwordResetOTPs.set(email, { otp, otpExpires });

    // Send OTP email
    await sendEmail(email, 'Password Reset OTP', {
      type: 'resendOtp',
      otp,
    });

    // Create temporary token for OTP verification
    const tempToken = jwt.sign(
      { email, purpose: 'password-reset' },
      JWT_SECRET,
      { expiresIn: '10m' }
    );

    res.json({ 
      success: true,
      message: 'OTP sent to your email',
      tempToken
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error processing password reset request' 
    });
  }
};

exports.verifyPasswordResetOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Check if OTP exists and is not expired
    const otpData = passwordResetOTPs.get(email);
    if (!otpData || otpData.otpExpires < Date.now()) {
      passwordResetOTPs.delete(email); // Clean up expired OTP
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new one.'
      });
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Create new temp token for password reset
    const tempToken = jwt.sign(
      { email, purpose: 'password-reset-confirmed' },
      JWT_SECRET,
      { expiresIn: '10m' }
    );

    // Remove used OTP
    passwordResetOTPs.delete(email);

    res.json({ 
      success: true,
      message: 'OTP verified successfully',
      tempToken
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error verifying OTP' 
    });
  }
};


exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // ✅ Compare new password with current hashed password
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be the same as the previous password'
      });
    }

    // ✅ Hash the new password before saving
    user.password = newPassword;
    if(user.isFirstLogin){
      user.isFirstLogin = false
    }

    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
};
