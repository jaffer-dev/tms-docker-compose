import * as Yup from "yup";

export const CreateLeaveRequestSchema = Yup.object().shape({
  category: Yup.string()
    .required("Leave category is required"),

  fromDate: Yup.date()
    .required("Start date is required")
    .typeError("Invalid date format"),

  toDate: Yup.date()
    .required("End date is required")
    .typeError("Invalid date format")
    .min(
      Yup.ref("fromDate"),
      "End date cannot be before start date"
    ),

  file: Yup.mixed()
    .nullable()
    .test(
      "fileSize",
      "File size should not be larger than 5 MB",
      (value) => !value || (value && value.size <= 5 * 1024 * 1024)
    )
    .test(
      "fileType",
      "Only PDF, JPG, or PNG files are allowed",
      (value) =>
        !value ||
        ["application/pdf", "image/jpeg", "image/png"].includes(value.type)
    ),

  reason: Yup.string()
    .required("Reason is required")
    .min(10, "Reason must be at least 10 characters long")
    .max(300, "Reason cannot exceed 300 characters"),
});
