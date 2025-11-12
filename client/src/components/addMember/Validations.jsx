import * as Yup from "yup";

export const validationSchema = Yup.object({
    fullName: Yup.string().required('Full name is required').min(3, "Full Name must be at least 3 characters").max(30, "Full Name cannot exceed 50 characters"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    role: Yup.string().required("Role is required"),
});