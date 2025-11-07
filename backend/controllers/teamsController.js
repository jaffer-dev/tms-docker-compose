const Team = require('../models/Team');
const User = require('../models/User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { sendEmail } = require("../utils/emailService");
const crypto = require("crypto");
const { passwordChangeTokens } = require("../utils/passwordTokens");
const { Types } = require("mongoose");
const LeaveBalance = require('../models/LeaveBalance');
const ObjectId = Types.ObjectId;

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const JWT_SECRET = process.env.JWT_SECRET


const rolePermissionMap = {
  HOD: "Admin",
  SUPERVISOR: "Can Edit",
  EMPLOYEE: "Can View",
};

// create new team
exports.createTeam = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({
        message: 'Team title is required.',
        error: true
      });
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization token required.', error: true });
    }

    const token = authHeader.split(' ')[1]; // "Bearer <token>"
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token.', error: true });
    }

    const creator = await User.findById(decoded.id);
    if (!creator) {
      return res.status(404).json({ message: 'Creator user not found.', error: true });
    }

    // --------- 3. Create and save the team ---------
    const team = new Team({
      title: title.trim(),
      description: description || '',
      createdBy: creator._id,
      completedTasks: 0,
      monthlyStats: {
        Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
        Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0,
      },
    });

    await team.save();

    return res.status(201).json({
      message: `Team "${title}" created successfully.`,
      team,
    });
  } catch (err) {
    console.error('Error creating team:', err);
    return res.status(500).json({
      message: 'Unexpected error while creating team.',
      error: true
    });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid team ID format', error: true });
    }

    // 2. Attempt deletion
    const deletedTeam = await Team.findByIdAndDelete(id);

    // 3. Handle not found
    if (!deletedTeam) {
      return res.status(404).json({ message: 'Team not found or already deleted', error: true });
    }

    // 4. Success response
    return res.status(200).json({ message: 'Team deleted successfully', deletedTeam });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ message: 'Server error while deleting team', error: true });
  }
};

exports.getAllTeams = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token is required',
      code: 'MISSING_AUTH_TOKEN',
      error: true
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { id: userId, role } = decoded; // 👈 make sure "id" hi encode kar rahe ho login me

    if (!role) {
      return res.status(403).json({
        success: false,
        message: 'User role not found',
        code: 'MISSING_ROLE',
        error: true
      });
    }

    let matchStage = {};

    if (['SUPER_ADMIN', 'SUB_ADMIN', 'MANAGER'].includes(role)) {
      // ✅ Full access → show all teams
      matchStage = {};
    } else if (['HOD', 'SUPERVISOR'].includes(role)) {
      // ✅ Show only team where user is member or hod
      matchStage = {
        $or: [
          { "hodId": new mongoose.Types.ObjectId(userId) },
          { "supervisorId": new mongoose.Types.ObjectId(userId) },
          { "members.user": new mongoose.Types.ObjectId(userId) }
        ]
      };
    } else {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view teams',
        code: 'UNAUTHORIZED_ROLE',
        error: true
      });
    }

    const teams = await Team.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "department._id",
          as: "members"
        }
      },
      {
        $project: {
          title: 1,
          description: 1,
          createdBy: 1,
          hodId: 1,
          createdAt: 1,
          total: 1,
          pending: 1,
          inProgress: 1,
          assigned: 1,
          review: 1,
          closed: 1,
          members: {
            _id: 1,
            username: 1,
            email: 1,
            role: 1,
            isActive: 1
          }
        }
      }
    ]);

    if (!teams || teams.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No teams found',
        teams: []
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Teams retrieved successfully',
      count: teams.length,
      teams
    });

  } catch (error) {
    console.error('Error fetching teams:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
        error: true
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
        error: true
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching teams',
      code: 'SERVER_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


//  Microsoft Signup for department user
exports.addMemberToTeam = async (req, res) => {
  try {
    const { fullName, workEmail, role, departmentId } = req.body;

    //  Token & Role Check (same as addMemberToTeam)
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: true, message: "No token provided" });
    const userDetails = jwt.verify(token, JWT_SECRET);
    if (["HOD", "SUPERVISOR", "EMPLOYEE"].includes(userDetails.role)) {
      return res.status(403).json({ error: true, message: "Employees cannot add team members." });
    }

    //  Required Fields
    if (!fullName || !workEmail || !role || !departmentId) {
      return res.status(400).json({ error: true, message: "Missing required fields." });
    }

    //  Team Check
    const team = await Team.findById(departmentId);
    if (!team) return res.status(404).json({ error: true, message: "Team not found." });

    //  HOD / SUPERVISOR limit (same logic)
    if ((role === "HOD" && team.hodId) || (role === "SUPERVISOR" && team.supervisorId)) {
      return res.status(400).json({ error: true, message: `This team already has a ${role}` });
    }

    //  User existence check
    const existing = await User.findOne({ email: workEmail.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: true, message: "Email already exists in another team" });
    }

    //  Create User but mark as NOT verified by Microsoft
    const user = await User.create({
      username: fullName.trim(),
      email: workEmail.trim(),
      role,
      isFilledPersonalDocs : false,
      isMicrosoftVerified: false,
      department: { _id: team._id, title: team.title, permission: rolePermissionMap[role] || [] },
    });

    await LeaveBalance.create({
      userId: user._id,
      totalLeaves: 32,
      annual: 14,
      casual: 10,
      sick: 8,
      remaining: { annual: 14, casual: 10, sick: 8 }
    });

    //  Send Microsoft Verify Email
    const verifyUrl = `${process.env.FRONT_URL}/verify-microsoft/${user._id}`;
    await sendEmail(workEmail, "Verify Your Microsoft Account", {
      type: "verifyMicrosoft",
      link: verifyUrl
    });

    //  Update Team references
    if (role === "HOD") team.hodId = user._id;
    if (role === "SUPERVISOR") team.supervisorId = user._id;
    await team.save();

    return res.status(201).json({
      message: "User added to team. Microsoft verification email sent.",
      userId: user._id,
      error: false,
      team: { _id: team._id, title: team.title }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Unexpected server error" });
  }
};


exports.simpleAddMemberToTeam = async (req, res) => {
  try {
    const { fullName, workEmail, role, departmentId } = req.body;

    // ✅ Token verification
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided", error: true });

    let userDetails;
    try {
      userDetails = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid or expired token", error: true });
    }

    if (["HOD", "SUPERVISOR", "EMPLOYEE"].includes(userDetails.role)) {
      return res.status(403).json({ message: "Employees cannot add team members.", error: true });
    }

    // ✅ Required fields
    if (!fullName || !workEmail || !departmentId || !role) {
      return res.status(400).json({ message: "fullName, workEmail, departmentId and role are required.", error: true });
    }

    if (!["HOD", "SUPERVISOR", "EMPLOYEE"].includes(role)) {
      return res.status(400).json({ message: "Role must be one of: HOD, SUPERVISOR, EMPLOYEE", error: true });
    }

    // ✅ Find team
    const team = await Team.findById(departmentId);
    if (!team) {
      return res.status(404).json({ message: `Team with departmentId ${departmentId} not found.`, error: true });
    }

    // ✅ Restrict only 1 HOD & 1 Supervisor
    if ((role === "HOD" && team.hodId) || (role === "SUPERVISOR" && team.supervisorId)) {
      return res.status(400).json({ message: `This team already has a ${role}.`, error: true });
    }

    // ✅ Check if user exists
    let existingByEmail = await User.findOne({
      email: workEmail.trim().toLowerCase()
    }).populate("department", "title");

    if (existingByEmail) {
      return res.status(409).json({
        message: `User with email ${existingByEmail.email} already exists in ${existingByEmail?.department?.title} team cannot be added again.`,
        field: "email",
        error: true
      });
    }

    // Ab username (fullName) check karo
    let existingByName = await User.findOne({
      username: fullName.trim()
    }).populate("department", "title");

    if (existingByName) {
      return res.status(409).json({
        field: "username",
        message: `User with username ${existingByName.username} already exists ${existingByName?.department?.title} team cannot be added again.`,
        error: true
      });
    }

    let user = await User.findOne({ email: workEmail.trim().toLowerCase() });

    // ✅ Create new user
    const randomPassword = crypto.randomBytes(9).toString("base64").replace(/[^A-Za-z0-9]/g, "").slice(0, 12);

    user = await User.create({
      username: fullName.trim(),
      email: workEmail.trim().toLowerCase(),
      password: randomPassword,
      role,
      isFilledPersonalDocs : false,
      department: { _id: team._id, title: team.title, permission: rolePermissionMap[role] || [] }, // 👈 only reference to Team
      isFirstLogin: true,
    });

    await LeaveBalance.create({
      userId: user._id,
      totalLeaves: 32,
      annual: 14,
      casual: 10,
      sick: 8,
      remaining: { annual: 14, casual: 10, sick: 8 }
    });

    // ✅ Assign role-specific IDs to Team
    if (role === "HOD") team.hodId = user._id;
    if (role === "SUPERVISOR") team.supervisorId = user._id;
    await team.save();

    // ✅ Send password reset mail
    const passwordChangeToken = crypto.randomBytes(32).toString("hex");
    passwordChangeTokens.set(passwordChangeToken, {
      userId: user._id.toString(),
      expires: Date.now() + 60 * 60 * 1000,
    });

    const passwordChangeUrl = `${BASE_URL}/change-password?token=${passwordChangeToken}`;
    await sendEmail(user.email, "Your Account Has Been Created", {
      type: "newAccount",
      password: randomPassword,
      link: passwordChangeUrl,
    });

    return res.status(201).json({
      message: `${user.email} was added to the team. ${user.isFirstLogin ? "Check email for login details." : ""}`,
      user,  // 👈 return user instead of updated team.members
      team: { _id: team._id, title: team.title }, // only lightweight ref
    });

  } catch (err) {
    console.error("addMemberToTeam error:", err);
    return res.status(500).json({ message: "Unexpected server error while adding the member.", error: true });
  }
};

exports.getTeamMembers = async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!departmentId) {
      return res.status(400).json({ message: 'teamId is required in params', error: true });
    }

    // Ensure teamId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ message: 'Invalid teamId format', error: true });
    }

    // ✅ Find team first
    const team = await Team.findById(departmentId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found', error: true });
    }

    // ✅ Fetch all users who belong to this team
    const members = await User.find({ "department._id": team._id })
      .select("_id username email role  isActive department isFirstLogin");

    if (!members || members.length === 0) {
      return res.status(200).json({ message: 'No members found for this department', error: false });
    }

    res.status(200).json({
      message: 'Team members retrieved successfully',
      team: { _id: team._id, title: team.title },
      members,
    });

  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ message: 'Internal server error while fetching team members', error: true });
  }
};



exports.getAllHODs = async (req, res) => {
  try {
    const hods = await User.find({ role: "HOD" })
      .populate("department", "title") // ya agar team ref save hai to "team"
      .select("username email")
      .lean();

    const result = hods.map(hod => ({
      id: hod._id,
      username: hod.username,
      email: hod.email,
      teamName: hod.department?.title || "N/A"
    }));

    return res.status(200).json({
      success: true,
      hods: result,
    });

  } catch (error) {
    console.error("Error fetching HODs:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getEmployeesByHOD = async (req, res) => {
  try {

    const userId = req.user?.id; // ✅ Token se nikala user ka id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID missing from token",
      });
    }

    // 1. User find karo (department fetch karne ke liye)
    const user = await User.findById(userId)
      .populate("department", "title _id")
      .lean();

    if (!user || !["HOD", "SUPERVISOR"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Only HOD or Supervisor can view employees",
      });
    }

    // 2. Us department ke employees nikal lo (khud ko exclude karke)
    const employees = await User.find({
      "department._id": user.department?._id,
    })
      .select("username email role")
      .lean();

    // 3. Format result
    const result = employees.map((emp) => ({
      id: emp._id,
      username: emp.username,
      email: emp.email,
      role: emp.role,
    }));

    return res.status(200).json({
      success: true,
      department: user.department?.title || "N/A",
      employees: result,
    });
  } catch (error) {
    console.error("Error fetching employees by HOD/Supervisor:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};





const checkUserInDbOrTeam = async (userId) => {
  try {
    // 1. User collection me check karo
    const user = await User.findById(userId);
    if (user) {
      return { exists: true, source: "User", data: user };
    }

    // 2. Team collection me check karo (maan lo members array me store hota hai)
    const team = await Team.findOne({ members: userId });
    if (team) {
      return { exists: true, source: "Team", data: team };
    }

    // Agar dono me nahi mila
    return { exists: false, source: null, data: null };
  } catch (error) {
    console.error("Error checking user:", error);
    throw error;
  }
};