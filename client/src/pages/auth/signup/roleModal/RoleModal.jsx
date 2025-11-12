import React, { useRef } from 'react';
import { Modal, Button, Typography, Form as AntForm, Select } from 'antd';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { BsMicrosoftTeams } from 'react-icons/bs';
import './RoleModal.css';
import { useMsal } from '@azure/msal-react';
// import { loginRequest } from '../../../../msalConfig';
import { useDispatch, useSelector } from 'react-redux';
import { microsoftSignup } from '../../../../store/actions/Auth.action';
import CSelect from '../../../../uiComponents/cSelect/CSelect';

const { Title } = Typography;
const { Option } = Select;

// ✅ Validation Schema
const validationSchema = Yup.object().shape({
    role: Yup.string().required('Role is required'),
});

const RoleModal = ({ isOpen, setIsOpen }) => {
    const formRef = useRef(null);
    const { instance } = useMsal();
    const dispatch = useDispatch();

    const { loading } = useSelector(({ auth }) => ({
        loading: auth.msSignUpLoading
    }))

    const callback = () => {
        setIsOpen(false);
    };

    // const handleSubmit = async (values) => {
    //     try {
    //         const loginResponse = await instance.loginPopup(loginRequest);

    //         const idToken = loginResponse?.idToken;
    //         if (!idToken) {
    //             console.error("No ID token returned from Microsoft.");
    //             return;
    //         }

    //         const payload = {
    //             idToken,
    //             role: values.role,
    //         };
    //         dispatch(microsoftSignup(payload, callback));
    //     } catch (error) {
    //         console.error('Microsoft Login Error:', error);
    //     }
    // };

    const handleCancel = () => {
        setIsOpen(false);
        if (formRef.current) {
            formRef.current.resetForm();
        }
    };

    return (
        <Modal
            open={isOpen}
            onCancel={handleCancel}
            footer={null}
            width={450}
            destroyOnClose
        >
            <div className="role-container">
                <Title level={4}>Select Role</Title>

                <Formik
                    innerRef={formRef}
                    initialValues={{ role: '' }}
                    validationSchema={validationSchema}
                >
                    {({
                        handleSubmit,
                        handleBlur,
                        setFieldValue,
                        values,
                        touched,
                        errors,
                        submitCount
                    }) => (
                        <form onSubmit={handleSubmit}>

                            <CSelect
                                placeholder="Select a role"
                                value={values.role || undefined}
                                onChange={(value) => setFieldValue('role', value)}
                                onBlur={() => handleBlur({ target: { name: 'role' } })}
                                data={[
                                    { key: "Auditor", label: "Auditor" },
                                    { key: "manager", label: "Manager" },
                                    { key: "HR", label: "HR" },
                                ]}
                                error={submitCount ? errors.role : touched.role && errors.role}
                            >
                            </CSelect>

                            <div style={{ marginTop: '40px', display: 'flex', gap: '10px' }}>
                                <Button
                                    htmlType="submit"
                                    block
                                    type="default"
                                    className="auth-btn auth-btn-dark"
                                    loading={loading}
                                >
                                    <BsMicrosoftTeams size={20} />
                                    Signup
                                </Button>
                            </div>
                        </form>
                    )}
                </Formik>
            </div>
        </Modal>
    );
};

export default RoleModal;
