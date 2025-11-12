import React from 'react';
import { Modal, Button, Input, Select, Form as AntForm } from 'antd';
import { Formik } from 'formik';
const { Option } = Select;
import '../createTaskModal/CreateTaskModal.css'
import { addDepartmentMember, getDepartments } from "../../store/actions/Departments.action"
import { useDispatch, useSelector } from 'react-redux';
import { validationSchema } from "./Validations"
import { CInput } from '../../uiComponents';
import CSelect from '../../uiComponents/cSelect/CSelect';

const AddDepartmentMember = ({ isOpenAddModal, setIsOpenAddModal, departmentId, onSuccess }) => {

    const { userRole, userId, loading } = useSelector(({ auth, departments }) => {
        return {
            userRole: auth?.user?.role,
            userId: auth?.user?._id,

            loading: departments?.addDepartMemberLoading
        };
    });
    const dispatch = useDispatch()

    const initialValues = {
        fullName: '',
        email: '',
        role: '',
    };

    const callBack = (resetForm) => {
        setIsOpenAddModal(false);
        resetForm();
        if (onSuccess) onSuccess();
        const payload = { userId, role: userRole };
        dispatch(getDepartments(payload));

    };

    const handleSubmit = (values, { resetForm }) => {
        const payload = {
            fullName: values.fullName,
            workEmail: values.email,
            role: values.role,
            departmentId: departmentId,
        };
        dispatch(addDepartmentMember(payload, () => callBack(resetForm)));
    };

    return (
        <>
            <Modal
                open={isOpenAddModal}
                onCancel={!loading && (() => setIsOpenAddModal(false))}
                footer={null}
                width={436}
                destroyOnClose
            >
                <div className="add-team-member" >
                    <h1 className='form-title margin-bottom32'>Add Member</h1>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleSubmit,
                            handleBlur,
                            setFieldValue,
                            submitCount
                        }) => (
                            <AntForm layout="vertical" onFinish={handleSubmit}>

                                <CInput
                                    label="Full Name"
                                    name="fullName"
                                    placeHolder="Enter full name"
                                    value={values.fullName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    disabled={loading}
                                    error={submitCount ? errors.fullName : touched.fullName && errors.fullName}
                                />

                                <CInput
                                    label="Work Email"
                                    name="email"
                                    placeHolder="Enter email"
                                    value={values.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                    onBlur={() => handleBlur}
                                    error={submitCount ? errors.email : touched.email && errors.email}
                                />
                                
                                <CSelect
                                    label="Role"
                                    name="role"
                                    placeholder="Select role"
                                    value={values.role || undefined}
                                    disabled={loading}
                                    onChange={(value) => setFieldValue('role', value)}
                                    onBlur={handleBlur}
                                    data={[
                                        { key: "HOD", label: "Head Of Department" },
                                        { key: "SUPERVISOR", label: "Supervisor" },
                                        { key: "EMPLOYEE", label: "Employee" },
                                    ]}
                                    error={submitCount ? errors.role : touched.role && errors.role}
                                >
                                </CSelect>

                                <div className='form-actions'>
                                    <Button block type="primary" disabled={loading} loading={loading} htmlType="submit" className="submit-button">
                                        Add Member
                                    </Button>
                                </div>
                            </AntForm>
                        )}
                    </Formik>
                </div>
            </Modal >
        </>
    );
};

export default AddDepartmentMember;