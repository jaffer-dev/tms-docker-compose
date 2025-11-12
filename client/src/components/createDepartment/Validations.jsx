import * as Yup from "yup"

export const validationSchema = Yup.object({
  title: Yup.string()
    .max(30, 'Maximum 30 characters allowed').required('Title is required')
    .matches(/^[A-Za-z0-9 _-]*$/, "Only letters, numbers, spaces, _ and - are allowed"),

  description: Yup.string()
    .max(75, "Maximum 75 characters allowed")
    .notRequired(),

});