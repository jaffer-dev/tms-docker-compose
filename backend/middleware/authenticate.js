const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;

// Role-based auth middleware
const authorizeRoles = (...roles) => {
  return async (req, res, next) => {
    try {
      // Token from header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: true, message: "No token provided" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const role = decoded?.role
      // Find user
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ error: true, message: "User not found" });
      }

      if (!user) {
        return res.status(404).json({ error: true, message: "User not found" });
      }

      if (!role) {
        return res.status(404).json({ error: true, message: "Role not found" })
      }


      // Role check
      if (!roles.includes(user.role)) {
        return res.status(403).json({ error: true, message: "Access denied: insufficient permissions" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Authorization error:", error);
      res.status(401).json({ error: true, message: "Invalid or expired token" });
    }
  };
};

module.exports = { authorizeRoles };
