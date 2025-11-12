import React, { useRef } from 'react'
import { CInput } from '../../uiComponents'
import { Form, Formik } from 'formik'
import { Button, Divider } from 'antd';
import CSelect from '../../uiComponents/cSelect/CSelect';
import { basicSchema, contactInfoSchema } from './Validations';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserPersonalDetails } from '../../store/actions/Users.action';

const ContactInfo = ({ onSelect, loading, data }) => {
  const form = useRef(null);
  const dispatch = useDispatch()

  const { userId, submitLoading } = useSelector(({ auth, users }) => ({
    submitLoading: users?.updateUserPersonalDetailsLoading,
    userId: auth?.user._id,
  }));

  const submit = (val) => {
    let payload = {
      ...data?.values,
      userId: userId,
      address: val?.address,
      personalEmail: val?.personalEmail,
      personalMobile: val?.personalMobile,
      emergencyContactName: val?.emergencyContactName,
      emergencyContactNo: val?.emergencyContactNo,
      relationship: val?.relationship,
      alternateContactNo: val?.alternateContactNo,
    }

    dispatch(updateUserPersonalDetails(payload))
  }

  return (
    <div className='form-main margin-top_20'>

      <Formik
        innerRef={form}
        validationSchema={contactInfoSchema}
        validateOnChange={true}
        validateOnBlur={true}
        initialValues={{
          address: '',
          personalEmail: '',
          personalMobile: '',
          emergencyContactName: '',
          emergencyContactNo: '',
          relationship: '',
          alternateContactNo: '',
        }}
        onSubmit={submit}
      >
        {({ errors, touched, handleSubmit, values, setFieldTouched, submitCount, handleChange, setFieldValue, handleBlur }) => (
          <Form onSubmit={(e) => { handleSubmit(e) }}>
            <CInput
              label="Address *"
              name="address"
              placeHolder="Enter address"
              value={values.address}
              onChange={handleChange}
              disabled={loading || submitLoading}
              onBlur={() => handleBlur}
              error={submitCount ? errors.address : touched.address && errors.address}
            />



            <CInput
              label="Personal Mobile *"
              name="personalMobile"
              placeHolder="Enter personal mobile"
              value={values.personalMobile}
              onChange={handleChange}
              disabled={loading || submitLoading}
              onBlur={() => handleBlur}
              error={submitCount ? errors.personalMobile : touched.personalMobile && errors.personalMobile}
            />

            <CInput
              label="Personal Email *"
              name="personalEmail"
              placeHolder="Enter personal email"
              value={values.personalEmail}
              onChange={handleChange}
              disabled={loading || submitLoading}
              onBlur={() => handleBlur}
              error={submitCount ? errors.personalEmail : touched.personalEmail && errors.personalEmail}
            />


            <Divider orientation="left">Emergency Contact Info</Divider>
            <div className="d-flex gap-5">
              <CInput
                label="Emergency Contact Name *"
                name="emergencyContactName"
                placeHolder="Enter emergency contact name"
                value={values.emergencyContactName}
                onChange={handleChange}
                disabled={loading || submitLoading}
                onBlur={() => handleBlur}
                error={submitCount ? errors.emergencyContactName : touched.emergencyContactName && errors.emergencyContactName}
              />

              <CInput
                label="Emergency Contact No *"
                name="emergencyContactNo"
                placeHolder="Enter emergency contact no"
                value={values.emergencyContactNo}
                onChange={handleChange}
                disabled={loading || submitLoading}
                onBlur={() => handleBlur}
                error={submitCount ? errors.emergencyContactNo : touched.emergencyContactNo && errors.emergencyContactNo}
              />

            </div>


            <CInput
              label="Relationship *"
              name="relationship"
              placeHolder="Enter relationship"
              value={values.relationship}
              onChange={handleChange}
              disabled={loading || submitLoading}
              onBlur={() => handleBlur}
              error={submitCount ? errors.relationship : touched.relationship && errors.relationship}
            />

            <CInput
              label="Alternate Contact No *"
              name="alternateContactNo"
              placeHolder="Enter alternateContactNo"
              value={values.alternateContactNo}
              onChange={handleChange}
              disabled={loading || submitLoading}
              onBlur={() => handleBlur}
              error={submitCount ? errors.alternateContactNo : touched.alternateContactNo && errors.alternateContactNo}
            />
            <Divider size="middle" />



            <Button
              className="user-details-form-btn"
              type="primary"
              htmlType="submit"
              loading={loading || submitLoading}
              disabled={loading || submitLoading}
            >
              Submit
            </Button>

          </Form>)}
      </Formik>
    </div>
  )
}

export default ContactInfo