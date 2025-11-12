import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
  role: Yup.string().required('Role is required')
});