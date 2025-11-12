import * as Yup from "yup";

export const basicSchema = Yup.object().shape({
    fullName: Yup.string()
        .trim()
        .required("Full name is required")
        .min(3, "Full name must be at least 3 characters"),

    fatherName: Yup.string()
        .trim()
        .required("Father name is required")
        .min(3, "Father name must be at least 3 characters"),

    microsoftEmail: Yup.string()
        .trim()
        .email("Invalid email format")
        .required("Microsoft email is required"),

    nationality: Yup.string()
        .required("Please select nationality"),

    gender: Yup.string()
        .required("Please select gender"),

    maritalStatus: Yup.string()
        .required("Please select marital status"),

   dateOfJoining: Yup.date()
        .required("Please select date of joining"),

    designation: Yup.string()
        .trim()
        .required("Designation is required")
        .min(2, "Designation must be at least 2 characters"),

    cnic: Yup.string()
        .trim()
        .required("cnic no is required")
        .min(14, "cnic no must be at least 14 characters"),
});


export const contactInfoSchema = Yup.object().shape({
  address: Yup.string()
    .trim()
    .required("Address is required")
    .min(5, "Address must be at least 5 characters long"),

  personalEmail: Yup.string()
    .trim()
    .email("Invalid email format")
    .required("Personal email is required"),

  personalMobile: Yup.string()
    .required("Personal mobile number is required")
    .matches(/^[0-9]{10,15}$/, "Enter a valid mobile number"),

  emergencyContactName: Yup.string()
    .trim()
    .required("Emergency contact name is required")
    .min(3, "Name must be at least 3 characters"),

  emergencyContactNo: Yup.string()
    .required("Emergency contact number is required")
    .matches(/^[0-9]{10,15}$/, "Enter a valid contact number"),

  relationship: Yup.string()
    .trim()
    .required("Relationship is required")
    .min(2, "Enter a valid relationship"),

  alternateContactNo: Yup.string()
    .nullable()
    .matches(/^[0-9]{10,15}$/, "Enter a valid contact number")
    .notRequired(),
});
