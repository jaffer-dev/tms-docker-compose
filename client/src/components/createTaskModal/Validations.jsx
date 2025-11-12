import * as Yup from "yup";

export const validationSchema = Yup.object({
    title: Yup.string()
        .required("Title is required")
        .max(25, "Maximum 25 words allowed"),
    description: Yup.string()
        .required("Description is required")
        .test("wordCount", "Maximum 500 words allowed", (value) => {
            if (!value) return true;
            const text = value.replace(/<[^>]+>/g, ""); // HTML tags remove
            return text.trim().split(/\s+/).length <= 500;
        }),
    assignee: Yup.string().required("Assign To is required"),
    deadline: Yup.date()
    .nullable()
    .when("type", {
      is: (val) => val !== "MEMO",
      then: (schema) => schema.required("Deadline is required"), // required
      otherwise: (schema) => schema.notRequired(), 
    }),
    priority: Yup.string()
    .when("type", {
        is: (val) => val !== "MEMO",
        then: (schema) => schema.required("Deadline is required"), // required
        otherwise: (schema) => schema.notRequired(), 
      }),
    type: Yup.string().required("type is required"),
    // assignToDepartment: Yup.string().required("Select Department is required"),
    // employees: Yup.string().required("Select employee is required"),
    // hr: Yup.string().required("Admin is required"),
});
