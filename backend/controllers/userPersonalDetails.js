const PersonalDetails = require("../models/UserPersonalDetails");
const User = require("../models/User");

// Create or Update Personal Details
exports.savePersonalDetails = async (req, res) => {
  try {
    const {
      userId,
      microsoftEmail,
      fullName,
      fatherName,
      nationality,
      dateOfJoining,
      gender,
      cnic,
      maritalStatus,
      designation,
      address,
      personalMobile,
      personalEmail,
      emergencyContactName,
      emergencyContactNo,
      relationship,
      alternateContactNo,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check if user already has personal details
    let existingRecord = await PersonalDetails.findOne({ userId });

    if (existingRecord) {
      // Update existing record
      existingRecord = await PersonalDetails.findOneAndUpdate(
        { userId },
        {
          microsoftEmail,
          fullName,
          fatherName,
          nationality,
          dateOfJoining,
          gender,
          cnic,
          maritalStatus,
          designation,
          address,
          personalMobile,
          personalEmail,
          emergencyContactName,
          emergencyContactNo,
          relationship,
          alternateContactNo,
        },
        { new: true }
      );
    } else {
      // Create new record
      existingRecord = await PersonalDetails.create({
        userId,
        microsoftEmail,
        fullName,
        fatherName,
        nationality,
        dateOfJoining,
        gender,
        cnic,
        maritalStatus,
        designation,
        address,
        personalMobile,
        personalEmail,
        emergencyContactName,
        emergencyContactNo,
        relationship,
        alternateContactNo,
      });
    }

    // Update user flag
    await User.findByIdAndUpdate(userId, { isFilledPersonalDocs: true });

    return res.status(200).json({
      success: true,
      message: "Personal details saved successfully",
      data: existingRecord,
    });
  } catch (error) {
    console.error("Error saving personal details:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while saving personal details",
      error: error.message,
    });
  }
};
