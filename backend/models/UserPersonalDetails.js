const mongoose = require("mongoose");

const PersonalDetailsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    microsoftEmail: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    fatherName: {
      type: String,
      required: true,
    },
    nationality: {
      type: String,
      required: true,
    },
    dateOfJoining: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      required: true,
    },
    cnic: {
      type: String,
      required: true,
    },
    maritalStatus: {
      type: String,
      enum: ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"],
      required: true,
    },
    designation: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
    personalMobile: {
      type: String,
      required: true,
    },
    personalEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    emergencyContactName: {
      type: String,
      required: true,
    },
    relationship: {
      type: String,
      required: true,
    },
    emergencyContactNo: {
      type: String,
      required: true,
    },
    alternateContactNo: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PersonalDetails", PersonalDetailsSchema);
