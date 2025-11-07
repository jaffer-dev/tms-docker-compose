const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // password: { type: String, required: false },
  role: { type: String, required: true, enum: ['SUPER_ADMIN', 'AUDITOR', 'EMPLOYEE', 'MANAGER', 'SUB_ADMIN', 'SUPERVISOR', 'HOD'] },
  isActive: { type: Boolean, default: true },
  isMicrosoftVerified: { type: Boolean, default: false },
  // isFirstLogin: { type: Boolean, default: true },
  department: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    title: String,
    permission: {
      type: String,
      enum: ['Can View', 'Can Edit', 'Admin'],
      default: 'Can View',
    },
  },
  isFilledPersonalDocs : { type: Boolean, default: false },
  personalDetails :{ _id: { type: mongoose.Schema.Types.ObjectId, ref: "PersonalDetails" }},
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
