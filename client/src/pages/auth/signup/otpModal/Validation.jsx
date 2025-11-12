import * as Yup from "yup";

export const validationSchema = Yup.object({
  otp: Yup.string()
    .required('OTP is required')
    .min(6, 'OTP must be exactly 6 digits')
    .max(6, 'OTP must be exactly 6 digits')
    .matches(/^\d+$/, 'OTP must contain only digits'),
});
