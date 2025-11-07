import React from 'react'
import { Modal, Form as AntForm, Input, Select, Button } from 'antd'
import { Formik } from 'formik'
import { CInput } from '../../uiComponents'
import { validationSchema } from "./Validations"
import { useDispatch, useSelector } from 'react-redux'
import "./AddMember.css"
import { AddMembers } from '../../store/actions/Members.action'
import CSelect from '../../uiComponents/cSelect/CSelect'

const { Option } = Select;

const AddMember = ({ isAddMember, setIsAddMember, onSuccess }) => {

    const { loading } = useSelector(({ members }) => {
        return {
            loading: members?.addMembersLoading,
        };
    });

    const [form] = AntForm.useForm();
    const dispatch = useDispatch();

    const initialValues = {
        fullName: "",
        email: "",
        role: "",
    };

    const handleSubmit = (values, { resetForm }) => {
        const payload = {
            username: values.fullName,
            email: values.email,
            role: values.role,
        };

        const callBack = () => {
            setIsAddMember(false);
            resetForm();
            if (onSuccess) onSuccess();
        };

        dispatch(AddMembers(payload, callBack));
    };

    return (
        <Modal
            open={isAddMember}
            onCancel={!loading && (() => setIsAddMember(false))}
            footer={null}
            width={436}
            destroyOnClose
        >
            <div className="add-member">
                <h1 className='form-title margin-bottom32'>Add Member</h1>

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({
                        handleSubmit,
                        handleChange,
                        handleBlur,
                        setFieldValue,
                        values,
                        touched,
                        errors,
                        submitCount
                    }) => (
                        <AntForm layout="vertical" onFinish={handleSubmit} form={form}>

                            <CInput
                                label="Full Name"
                                name="fullName"
                                placeHolder="John Doe"
                                value={values.fullName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={loading}
                                error={submitCount ? errors.fullName : touched.fullName && errors.fullName}
                            />

                            <CInput
                                label="Work Email"
                                name="email"
                                placeHolder="john@email.com"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={loading}
                                error={submitCount ? errors.email : touched.email && errors.email}
                            />

                            <CSelect
                                label="Select Role"
                                placeholder="Select a role"
                                value={values.role || undefined}
                                onChange={(value) => setFieldValue("role", value)}
                                onBlur={() => handleBlur({ target: { name: "role" } })}
                                disabled={loading}
                                data={[
                                    { key: "SUB_ADMIN", label: "Sub Admin" },
                                    { key: "MANAGER", label: "Manager" },
                                ]}
                                error={submitCount ? errors.role : touched.role && errors.role}
                            >
                            </CSelect>
                            <div className="form-actions">
                                <Button
                                    type="default"
                                    block
                                    htmlType="submit"
                                    loading={loading}
                                    disabled={loading}
                                    className="submit-button"
                                >
                                    Add Member
                                </Button>
                            </div>
                        </AntForm>
                    )}
                </Formik>
            </div>
        </Modal>
    )
}

export default AddMember
