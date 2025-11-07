import React from 'react';
import {
  Modal,
  Input,
  Form as AntForm,
  Divider,
  Button,
} from 'antd';
import { Formik } from 'formik';
import './CreateDepartment.css';
import { useDispatch, useSelector } from 'react-redux';
import { createDepartment, getDepartments } from '../../store/actions/Departments.action';
import { validationSchema } from "./Validations"
import TextArea from 'antd/es/input/TextArea';
import { CInput } from '../../uiComponents';


const CreateDepartment = ({ isOpenAddModal, setIsOpenAddModal }) => {
  const dispatch = useDispatch();

  const { nonHrUser, nonHrUserLoading, loading, userRole, userId } = useSelector(({ auth, departments, users }) => ({
    nonHrUser: users?.getNonHrUsers || [],
    nonHrUserLoading: users?.getNonHrUsersLoading,
    loading: departments?.createDepartmentLoading,

    userId: auth?.user?._id,
    userRole: auth?.user?.role
  }));

  const initialValues = {
    title: '',
    description: ""
  };


  const callBack = () => {
    if (!loading) {
      setIsOpenAddModal(false)
      const payload = { userId, role: userRole };
      dispatch(getDepartments(payload));
    }
  }

  const handleSubmit = (values) => {
    const payload = {
      title: values.title,
      description: values.description,
    };
    dispatch(createDepartment(payload, callBack));
  };


  return (
    <Modal
      open={isOpenAddModal}
      onCancel={() => setIsOpenAddModal(false)}
      footer={null}
      width={600}
      destroyOnClose
      className="create-team-modal"
    >
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, errors, touched, handleChange, handleSubmit, handleBlur, submitCount }) => (
          <AntForm layout="vertical" onFinish={handleSubmit} className="create-team-form">

            <div className="form-header">
              <h1 className="form-title">Create New Department</h1>
              <p className="form-subtitle">Set up a new Department with a title, description</p>
            </div>
            <Divider />

              <CInput
                label="Department Title"
                name="title"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.title}
                placeHolder="Enter Department name"
                error={submitCount ? errors.title : touched.title && errors.title}
              />

            {/* Description */}
            <AntForm.Item label={<span className="form-label">Description</span>}>
              <TextArea
                name="description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                autoSize={{ minRows: 3, maxRows: 6 }}
                placeholder="Describe your department's purpose..."
                className="form-textarea"
              />
            </AntForm.Item>

            <Divider />

            <Button type="primary" htmlType="submit" className="submit-button" block loading={loading} disabled={loading}>
              Create Department
            </Button>
          </AntForm>
        )}
      </Formik>
    </Modal>
  );
};

export default CreateDepartment;