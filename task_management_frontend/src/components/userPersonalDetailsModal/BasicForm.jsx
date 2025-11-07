import React, { useRef } from 'react'
import { CInput } from '../../uiComponents'
import { Form, Formik } from 'formik'
import { Button } from 'antd';
import CSelect from '../../uiComponents/cSelect/CSelect';
import { basicSchema } from './Validations';

const BasicForm = ({ onSelect, loading, data }) => {
    const form = useRef(null);

    const submit = (values) => {
        onSelect(values, 2);
    }

    return (
        <div className='form-main margin-top_20'>

            <Formik
                innerRef={form}
                validationSchema={basicSchema}
                validateOnChange={true}
                validateOnBlur={true}
                initialValues={{
                    fullName: data?.values?.fullName || '',
                    fatherName: data?.values?.fatherName || '',
                    microsoftEmail: data?.values?.microsoftEmail || '',
                    nationality: data?.values?.nationality || '',
                    gender: data?.values?.gender || '',
                    designation: data?.values?.designation || '',
                    maritalStatus: data?.values?.maritalStatus || '',
                    dateOfJoining: data?.values?.dateOfJoining || '',
                    cnic: data?.values?.cnic || '',
                }}
                onSubmit={submit}
            >
                {({ errors, touched, handleSubmit, values, setFieldTouched, submitCount, handleChange, setFieldValue, handleBlur }) => (
                   <Form>
                        <div className="d-flex gap-5">
                            <CInput
                                label="Full Name *"
                                name="fullName"
                                placeHolder="Enter fullname"
                                value={values.fullName}
                                onChange={handleChange}
                                disabled={loading}
                                onBlur={() => handleBlur}
                                error={submitCount ? errors.fullName : touched.fullName && errors.fullName}
                            />


                            <CInput
                                label="Father Name *"
                                name="fatherName"
                                placeHolder="Enter father name"
                                value={values.fatherName}
                                onChange={handleChange}
                                disabled={loading}
                                onBlur={() => handleBlur}
                                error={submitCount ? errors.fatherName : touched.fatherName && errors.fatherName}
                            />
                        </div>
                        <CInput
                            label="Microsoft Email *"
                            name="microsoftEmail"
                            placeHolder="Enter microsoft email"
                            value={values.microsoftEmail}
                            onChange={handleChange}
                            disabled={loading}
                            onBlur={() => handleBlur}
                            error={submitCount ? errors.microsoftEmail : touched.microsoftEmail && errors.microsoftEmail}
                        />
                        <div className="d-flex gap-5">

                            <CSelect
                                label="Select Nationality *"
                                placeholder="nationality"
                                value={values.nationality || undefined}
                                onChange={(value) => setFieldValue("nationality", value)}
                                onBlur={() => handleBlur({ target: { name: "nationality" } })}
                                disabled={loading}
                                data={[
                                    { key: "PAKISTAN", label: "Pakistan" },
                                    { key: "UAE", label: "Uae" },
                                    { key: "INDIA", label: "India" },
                                ]}
                                error={submitCount ? errors.nationality : touched.nationality && errors.nationality}
                            />

                            <CSelect
                                label="Select Gender *"
                                placeholder="gender"
                                value={values.gender || undefined}
                                onChange={(value) => setFieldValue("gender", value)}
                                onBlur={() => handleBlur}
                                disabled={loading}
                                data={[
                                    { key: "MALE", label: "Male" },
                                    { key: "FEMALE", label: "Female" },
                                    { key: "OTHER", label: "Other" },
                                ]}
                                error={submitCount ? errors.gender : touched.gender && errors.gender}
                            />
                        </div>

                        <div className="d-flex gap-5">


                            <CSelect
                                label="Select Marital Status *"
                                placeholder="maritalStatus"
                                value={values.maritalStatus || undefined}
                                onChange={(value) => setFieldValue("maritalStatus", value)}
                                onBlur={() => handleBlur}
                                disabled={loading}
                                data={[
                                    { key: "SINGLE", label: "Single" },
                                    { key: "MARRIED", label: "Married" },
                                    { key: "DIVORCED", label: "Divorced" },
                                    { key: "WIDOWED", label: "Widowed" },
                                ]}
                                error={submitCount ? errors.maritalStatus : touched.maritalStatus && errors.maritalStatus}
                            />

                            <CInput
                                label="Designation *"
                                name="designation"
                                placeHolder="Enter designation"
                                value={values.designation}
                                onChange={handleChange}
                                disabled={loading}
                                onBlur={() => handleBlur}
                                error={submitCount ? errors.designation : touched.designation && errors.designation}
                            />
                        </div>

                        <CInput
                            label="Date of Joining at KamelPay"
                            name="dateOfJoining"
                            type="date"
                            value={values.dateOfJoining}
                            onChange={handleChange}
                            error={errors.dateOfJoining}
                        />

                        <CInput
                            label="CNIC No *"
                            name="cnic"
                            placeHolder="Enter cnic no"
                            value={values.cnic}
                            onChange={handleChange}
                            disabled={loading}
                            onBlur={() => handleBlur}
                            error={submitCount ? errors.cnic : touched.cnic && errors.cnic}
                        />

                        <Button
                            className="user-details-form-btn"
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            disabled={loading}
                            onClick={handleSubmit}
                        >
                            Submit
                        </Button>

                    </Form>)}
            </Formik>
        </div>
    )
}

export default BasicForm


// microsoftEmail
// fullName
// fatherName
// nationality