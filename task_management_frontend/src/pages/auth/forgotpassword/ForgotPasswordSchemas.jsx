import * as Yup from "yup";

export const emailSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
});

export const otpValidationSchema = Yup.object().shape({
  otp: Yup.string()
    .required("Please enter the 6-digit OTP")
    .matches(/^[0-9]+$/, "OTP must contain only numbers")
    .length(6, "OTP must be exactly 6 digits"),
});


export const resetPasswordSchema = Yup.object({
  password: Yup.string()
    .min(6, 'Minimum 6 characters')
    .matches(/[a-z]/, 'Must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], "Passwords must match")
    .required("confirm Password is required"),
});
