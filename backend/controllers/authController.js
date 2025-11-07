const crypto = require("crypto");
const { passwordChangeTokens } = require("../utils/passwordTokens"); // central Map rakho
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/emailService');
const validator = require('validator');
const { error } = require("console");
const jwksClient = require("jwks-rsa");
const LeaveBalance = require("../models/LeaveBalance");

const JWT_SECRET = process.env.JWT_SECRET;
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 2. Check isActive
    if (user.isActive === false) {
      return res.status(403).json({ message: "Your account is inactive. Please contact admin." });
    }

    // 3. Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // 4. Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    // 5. Find existing changePassword token
    let changePasswordToken = null;
    for (let [storedUserId, storedToken] of passwordChangeTokens.entries()) {
      if (storedUserId === user._id.toString()) {
        changePasswordToken = storedToken;
        break;
      }
    }

    // 6. If not found, create new
    if (!changePasswordToken && user.isFirstLogin) {
      changePasswordToken = crypto.randomBytes(32).toString("hex");
      passwordChangeTokens.set(changePasswordToken, {
        userId: user._id.toString(),
        expires: Date.now() + 60 * 60 * 1000, // 1 hour expiry
      });
    }

    const { password: _, ...safeUser } = user.toObject();

    return res.json({
      success: true,
      message: "Login successful",
      token,
      isFirstLogin: user.isFirstLogin,
      changePasswordToken: changePasswordToken || null,
      user: safeUser,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// exports.login = async (req, res) => {
//   res.send("response from server")

// };

// POST /api/members microsoft
exports.addMember = async (req, res) => {
  const { username, email, role } = req.body;
  if (!username || !email || !role) {
    return res.status(400).json({ message: "fullName, workEmail & role are required" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const newUser = await User.create({
      username,
      email,
      role,
      department: null,
      isMicrosoftVerified: false
    });

    await LeaveBalance.create({
      userId: newUser._id,
      totalLeaves: 32,
      annual: 14,
      casual: 10,
      sick: 8,
      remaining: { annual: 14, casual: 10, sick: 8 } // only if you’re using extended schema
    });

    // Verification link for Microsoft OAuth
    const verifyUrl = `${process.env.FRONT_URL}/verify-microsoft/${newUser._id}`;

    await sendEmail(email, "Verify Your Microsoft Account", {
      type: "verifyMicrosoft",
      link: verifyUrl
    });

    res.status(201).json({
      message: "User created. Verification email sent.",
      userId: newUser._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${process.env.TENANT_ID}/discovery/v2.0/keys`
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

exports.verifyMicrosoftAccount = async (req, res) => {
  try {
    const { id, email, token } = req.body;
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    jwt.verify(
      token,
      getKey,
      {
        audience: process.env.AZURE_CLIENT_ID,
        issuer: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0`,
      },
      async (err, decoded) => {
        if (err) {
          return res.status(401).json({ success: false, message: "Invalid Microsoft token" });
        }

        const user = await User.findById(id);
        if (!user)
          return res.status(404).json({ success: false, message: "User not found" });

        if (user.isActive === false) {
          return res.status(403).json({ message: "Your account is inactive. Please contact admin." });
        }

        // Mark verified
        user.microsoftEmail = email;
        user.isMicrosoftVerified = true;
        await user.save();

        // 👉 Generate your own app token
        const appToken = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        return res.status(200).json({
          success: true,
          message: "Microsoft account verified successfully",
          token: appToken,                 // <-- send it
          data: { id: user._id, email: user.microsoftEmail },
        });
      }
    );
  } catch (err) {
    console.error("verify-microsoft error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.verifyMicrosoftLogin = async (req, res) => {
  try {
    const { idToken, email } = req.body;
    if (!idToken || !email) {
      return res.status(400).json({ success: false, message: "idToken or email missing" });
    }

    // ✅ Verify Microsoft ID token
    jwt.verify(
      idToken,
      getKey,
      {
        audience: process.env.AZURE_CLIENT_ID,
        issuer: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0`
      },
      async (err, decoded) => {
        if (err) {
          console.error("Microsoft token verification failed:", err);
          return res.status(401).json({ success: false, message: "Invalid Microsoft token" });
        }

        // ✅ Find user by Microsoft email
        const user = await User.findOne({ email: email });
        if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.isActive === false) {
          return res.status(403).json({ message: "Your account is inactive. Please contact admin." });
        }

        // ✅ Check if Microsoft account already verified in our DB
        if (!user.isMicrosoftVerified) {
          return res.status(403).json({ success: false, message: "Microsoft account not verified" });
        }

        // ✅ Issue your own app session token
        const appToken = jwt.sign(
          { id: user._id, email: user.email, role: user?.role },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        return res.status(200).json({
          success: true,
          message: "Microsoft login successful",
          token: appToken,
          user: { id: user._id, role: user?.role, email: user.microsoftEmail }
        });
      }
    );
  } catch (err) {
    console.error("verify-ms-login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/simpleAddMembers
exports.simpleAddMember = async (req, res) => {
  const { username, email, role } = req.body;

  if (!username || !email || !role) {
    return res.status(400).json({ message: "Username, email, and role are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists", error: true });

    // random password (pre-save hook hash karega)
    const randomPassword = [...crypto.randomBytes(16).toString('base64')]
      .filter(c => /[A-Za-z0-9!@#$%^&*]/.test(c)).slice(0, 12).join('');

    const newUser = new User({
      username,
      email,
      password: randomPassword,
      role,
      department: null,
      isFirstLogin: true
    });

    await newUser.save();

    await LeaveBalance.create({
      userId: newUser._id,
      totalLeaves: 32,
      annual: 14,
      casual: 10,
      sick: 8,
      remaining: { annual: 14, casual: 10, sick: 8 } // only if you’re using extended schema
    });

    // Create token and store by TOKEN as key
    const passwordChangeToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = Date.now() + 60 * 60 * 1000; // 1h

    passwordChangeTokens.set(passwordChangeToken, {
      userId: newUser._id.toString(),
      expires: tokenExpires,
    });

    const passwordChangeUrl = `${BASE_URL}/change-password?token=${passwordChangeToken}`;

    await sendEmail(email, "Your Account Has Been Created", {
      type: "newAccount",
      password: randomPassword,
      link: passwordChangeUrl,
    });

    return res.status(201).json({
      message: "User created successfully. Check your email for login details.",
      userId: newUser._id,
      email: newUser.email,
      nextStep: 'check-email'
    });

  } catch (err) {
    console.error(err);
    if (err.code === 11000) return res.status(400).json({ message: "Email already exists" });
    res.status(500).json({ message: "Server error during registration" });
  }
};

exports.changePassword = async (req, res) => {
  const { newPassword, token } = req.body;

  if (!newPassword || !token) {
    return res.status(400).json({ message: "New password and token are required" });
  }

  console.log(passwordChangeTokens)
  const stored = passwordChangeTokens.get(token);

  if (!stored) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  if (stored.expires < Date.now()) {
    passwordChangeTokens.delete(token);
    return res.status(400).json({ message: "Token expired" });
  }

  try {
    const user = await User.findById(stored.userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword;
    user.isFirstLogin = false;
    await user.save();

    passwordChangeTokens.delete(token);

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password Change Error:", err);
    res.status(500).json({ message: "Server error while changing password" });
  }
};


const pendingVerifications = new Map(); // email → { data, code, expiry }


function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
}

// 1️⃣ Send code
exports.initiateSignup = async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password || !role) return res.status(400).json({ message: 'All fields required' });

  const code = generateCode();
  pendingVerifications.set(email, {
    username,
    password,
    role,
    code,
    expires: Date.now() + 10 * 60 * 1000, // 10 mins
  });

  await sendEmail(email, 'Verification Code', `Hi ${username}, your verification code is: ${code}`);
  res.json({ message: 'Verification code sent to email' });
};

// 2️⃣ Verify code and complete registration
exports.completeSignup = async (req, res) => {
  const { email, code } = req.body;
  const data = pendingVerifications.get(email);
  if (!data) return res.status(400).json({ message: 'No verification pending' });

  if (data.code !== code) return res.status(400).json({ message: 'Incorrect code' });
  if (Date.now() > data.expires) return res.status(400).json({ message: 'Code expired' });

  const monthlyTasks = {
    January: 0, February: 0, March: 0, April: 0, May: 0,
    June: 0, July: 0, August: 0, September: 0,
    October: 0, November: 0, December: 0
  };

  const newUser = new User({
    username: data.username,
    email,
    password: data.password,
    role: data.role,
    monthlyTasks,
  });

  await newUser.save();
  pendingVerifications.delete(email);
  res.json({ message: 'Signup complete' });
};
