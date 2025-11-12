import React, { useState } from 'react'
import { Form as AntForm, Button, Col, DatePicker, Modal, Row, Upload } from 'antd'
import { Formik } from 'formik';
import { CreateLeaveRequestSchema } from "./Validation"
import TextArea from 'antd/es/input/TextArea';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import "./CreateLeaveRequest.css"
import { useDispatch, useSelector } from 'react-redux';
import { applyLeave } from '../../store/actions/Leaves.action';
import { handleRemoveFile, handleUpload } from '../../pages/taskDescription/Helper';
import CSelect from '../../uiComponents/cSelect/CSelect';

const CreateLeaveRequest = ({ open, close }) => {
    const [uploadedFiles, setUploadedFiles] = useState([]);

    const dispatch = useDispatch()

    const { loading } = useSelector(({ leaves }) => {
        return {
            loading: leaves?.applyLeaveLoading,
        };
    });

    const initialValues = {
        category: "",
        fromDate: "",
        toDate: "",
        file: "",
        reason: "",
    };

    const callBack = (resetForm) => {
        close(false)
        resetForm()
    }

    const handleSubmit = (val, { resetForm }) => {
        const payload = {
            category: val.category,
            fromDate: val.fromDate,
            toDate: val.toDate,
            reason: val.reason,
        }
        dispatch(applyLeave(payload, () => callBack(resetForm)))
    }

    return (
        <>
            <Modal
                open={open}
                onCancel={() => close(false)}
                footer={null}
                width={450}
                destroyOnClose
            >
                <div className="create-task-form-wrapper">
                    <div className="create-task-header margin-bottom32">
                        <h1 className="form-title">Apply  Leave / WFH</h1>
                    </div>

                    <Formik initialValues={initialValues} validationSchema={CreateLeaveRequestSchema} onSubmit={handleSubmit}>
                        {({ values, errors, touched, handleChange, handleSubmit, handleBlur, setFieldValue, submitCount }) => (
                            <AntForm layout="vertical" className="create-team-form" onFinish={handleSubmit}>
                                <Row gutter={16}>
                                    <Col xs={24} md={24}>
                                        <AntForm.Item>
                                            <CSelect
                                                label="Category"
                                                name="category"
                                                placeholder="Select category"
                                                onChange={(value) => setFieldValue("category", value)}
                                                onBlur={handleBlur}
                                                value={values.category || undefined}
                                                data={[
                                                    { key: "ANNUAL", label: "ANNUAL" },
                                                    { key: "CASUAL", label: "CASUAL" },
                                                    { key: "SICK", label: "SICK" },
                                                    { key: "WFH", label: "Work From Home" },
                                                ]}
                                                error={submitCount ? errors.category : touched.category && errors.category}
                                            >
                                            </CSelect>
                                        </AntForm.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col xs={24} md={24}>
                                        <AntForm.Item
                                            label={<span className="form-label">From Date</span>}
                                            validateStatus={touched.fromDate && errors.fromDate ? "error" : ""}
                                            help={touched.fromDate && errors.fromDate ? (
                                                <span className="error-message">{errors.fromDate}</span>
                                            ) : null}
                                        >
                                            <DatePicker
                                                name="fromDate"
                                                onChange={(value) => setFieldValue("fromDate", value)}
                                                onBlur={handleBlur}
                                                value={values.fromDate || null}
                                                placeholder="MM/DD/YYYY"
                                                className="form-input"
                                                disabledDate={(current) =>
                                                    current && current < new Date().setHours(0, 0, 0, 0)
                                                }
                                            />
                                        </AntForm.Item>
                                    </Col>

                                </Row>
                                <Row gutter={16}>
                                    <Col xs={24} md={24}>
                                        <AntForm.Item
                                            label={<span className="form-label">To Date</span>}
                                            validateStatus={touched.toDate && errors.toDate ? "error" : ""}
                                            help={touched.toDate && errors.toDate ? (
                                                <span className="error-message">{errors.toDate}</span>
                                            ) : null}
                                        >
                                            <DatePicker
                                                name="toDate"
                                                onChange={(value) => setFieldValue("toDate", value)}
                                                onBlur={handleBlur}
                                                value={values.toDate || null}
                                                placeholder="MM/DD/YYYY"
                                                className="form-input"
                                                disabledDate={(current) =>
                                                    current && current < new Date().setHours(0, 0, 0, 0)
                                                }
                                            />
                                        </AntForm.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col xs={24} md={24}>
                                        <AntForm.Item
                                            label={<span className="form-label">Reason</span>}
                                            validateStatus={touched.reason && errors.reason ? "error" : ""}
                                            help={touched.reason && errors.reason ? (
                                                <span className="error-message">{errors.reason}</span>
                                            ) : null}
                                        >
                                            <TextArea
                                                name="reason"
                                                value={values.reason || null}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                autoSize={{ minRows: 4, maxRows: 6 }}
                                                placeholder="Write description about leave or work from home"
                                                className="form-textarea"
                                            />
                                        </AntForm.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col xs={24} md={24}>
                                        <AntForm.Item
                                            label={<span className="form-label">Upload File</span>}
                                            validateStatus={touched.file && errors.file ? "error" : ""}
                                            help={touched.file && errors.file ? (
                                                <span className="error-message">{errors.file}</span>
                                            ) : null}
                                        >
                                            <Upload.Dragger
                                                // multiple
                                                beforeUpload={(file) => {
                                                    const isLt5M = file.size / 1024 / 1024 < 5;
                                                    if (!isLt5M) {
                                                        message.error(`${file.name} is larger than 5MB!`);
                                                        return Upload.LIST_IGNORE;
                                                    }
                                                    return false;
                                                }}
                                                showUploadList={false}
                                                onChange={(info) => handleUpload(info, setUploadedFiles)}
                                                className="upload-dragger"
                                                onClick={(e) => e.stopPropagation()}
                                                onDrop={(e) => e.stopPropagation()}
                                            >
                                                <p className="upload-icon"><UploadOutlined /></p>
                                                <p className="upload-text">Click or drag files to upload (up to 5 MB)</p>
                                            </Upload.Dragger>
                                            {uploadedFiles.length > 0 && uploadedFiles.map((file, idx) => (
                                                <div key={idx} className="uploaded-file-item">
                                                    <span>{file.name || `File ${idx + 1}`}</span>
                                                    <Button
                                                        type="text"
                                                        icon={<DeleteOutlined />}
                                                        onClick={() => handleRemoveFile(idx, uploadedFiles, setUploadedFiles)}
                                                    />
                                                </div>
                                            ))}
                                        </AntForm.Item>
                                    </Col>
                                </Row>
                                <div className="form-actions">
                                    <Button block type="primary" htmlType="submit" className="submit-button" loading={loading} disabled={loading}>
                                        Apply
                                    </Button>
                                </div>
                            </AntForm>
                        )}
                    </Formik>
                </div>
            </Modal>
        </>
    )
}

export default CreateLeaveRequest;