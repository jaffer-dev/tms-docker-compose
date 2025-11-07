// middlewares/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ 
        error: true,
        message: "Authorization token is required" 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    // Optional: If you want actual user object in request:
    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    req.user = user; 
    next();

  } catch (err) {
    return res.status(401).json({ error: true, message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;