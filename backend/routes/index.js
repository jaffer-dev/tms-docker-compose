const express = require("express");
const path = require("path");
const router = express.Router();

// Import all sub-routes
const authRoutes = require("./auth");
const teamRoutes = require("./team");
const membersRoutes = require("./member");
const usersRoutes = require("./users");
const notificationsRoutes = require("./notifications");
const otpRoutes = require("./otp");
const commentsRoutes = require("./comments");
const approvalRoutes = require("./approvals");
const tasksRoutes = require("./tasks");
const leaveRoutes = require("./leaves");
const roles = require('./roles')
const userPersonalDetails = require('./userPersonalDetails')

// Bind routes
router.use("/auth", authRoutes);
router.use("/department", teamRoutes);
router.use("/members", membersRoutes);
router.use("/user", usersRoutes);
router.use("/notification", notificationsRoutes);
router.use("/otp", otpRoutes);
router.use("/comments", commentsRoutes);
router.use("/approvals", approvalRoutes);
router.use("/task", tasksRoutes);
router.use("/leaves", leaveRoutes);
router.use("/roles", roles);
router.use("/personal-details", userPersonalDetails);

// Static and test routes
router.get("/test", (req, res) => {
  res.json({ message: "Morgan test" });
});

router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

router.get("/change-password", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/password-change.html"));
});

// Fallback (404 handler)
router.use(/.*/, (req, res) => {
  console.log(" Unhandled route:", req.originalUrl);
  console.log(" Method:", req.method);
  res.status(404).json({ error: "Route not found" });
});

module.exports = router;
