// CreateTaskModal.jsx
import React, { useEffect } from "react";
import {
    Modal, Form as AntForm, Input, Button, DatePicker, Select,
    Row, Col, Divider, Form
} from "antd";
import { Formik } from "formik";
import ReactQuill from "react-quill-new";
import { useDispatch, useSelector } from "react-redux";
import { validationSchema } from "./Validations.jsx";
import { createTask, getAllTask } from "../../store/actions/Task.action.jsx";
import { getUserStats } from "../../store/actions/Users.action.jsx";
import { getHodEmployees, getHods } from "../../store/actions/Departments.action.jsx";
import "react-quill/dist/quill.snow.css";
import "./CreateTaskModal.css";
import { readableText } from "../../utils/Methods";
import { CInput } from "../../uiComponents/index.jsx";
import CSelect from "../../uiComponents/cSelect/CSelect.jsx";

const { Option } = Select;

const CreateTaskModal = ({ isOpenAddModal, setIsOpenAddModal }) => {
    const [form] = AntForm.useForm();
    const dispatch = useDispatch();

    const {
        createTaskLoading,
        userRole,
        userId,
        hodEmployees,
        hods,
    } = useSelector(({ task, auth, departments }) => ({
        createTaskLoading: task?.createTaskLoading,
        userRole: auth?.user?.role,
        userId: auth?.user?._id,
        hodEmployees: departments.hodEmployees,
        hods: departments?.hods,
    }));

    const hodsList = userRole === "HOD" ? hods?.filter(item => item?.id !== userId) : hods

    useEffect(() => {
        dispatch(getHods());
    }, []);

    const initialValues = {
        title: "",
        description: "",
        type: "",
        assignToDepartment: "",
        assignee: "", // universal field (hodId OR employeeId)
        priority: "",
        deadline: null,
    };

    const modules = {
        toolbar: [
            [{ list: "ordered" }],
            ["bold", "italic", "underline"],
            ["link", "image"],
        ],
    };

    const formats = [
        "list",
        "ordered",
        "bold",
        "italic",
        "underline",
        "link",
        "image",
    ];

    const callback = () => {
        setIsOpenAddModal(false);
        dispatch(getAllTask({ role: userRole }));
        dispatch(getUserStats());
    }

    const handleSubmit = (values) => {
        const payload = {
            title: values.title,
            type: values.type,
            description: values.description,
            assignedBy: userId,
            assignTo: values.assignee,
            ...(values.type !== "MEMO" && { priority: values.priority }),
            ...(values.type !== "MEMO" && { deadline: values.deadline }),
        };

        dispatch(createTask(payload, callback));
    };

    return (
        <Modal
            open={isOpenAddModal}
            onCancel={() => setIsOpenAddModal(false)}
            footer={null}
            width={550}
            destroyOnClose
        >
            <div className="create-task-form-wrapper">
                <div className="create-task-header margin-bottom32">
                    <h1 className="form-title">Create New Task</h1>
                </div>

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        setFieldValue,
                        setFieldTouched,
                        touched,
                        errors,
                        values,
                        submitCount
                    }) => {
                        useEffect(() => {
                            if (userRole === 'HOD' && values.assignToDepartment === "ownDepartment") {
                                dispatch(getHodEmployees({ userId }));
                            }
                        }, [values.assignToDepartment]);

                        return (
                            <Form layout="vertical" form={form} onFinish={handleSubmit}>
                                <CInput
                                    label="Title"
                                    name="title"
                                    placeHolder="Enter task title"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.title}
                                    error={submitCount ? errors.title : touched.title && errors.title}
                                />

                                <Divider size="small" />

                                {/* Description */}
                                <AntForm.Item
                                    label={<span className="form-label">Description</span>}
                                    validateStatus={touched.description && errors.description ? "error" : ""}
                                    help={touched.description && errors.description ? (
                                        <span className="error-message">{errors.description}</span>
                                    ) : null}
                                >
                                    <ReactQuill
                                        name="description"
                                        value={values.description}
                                        onChange={(value) => {
                                            setFieldValue("description", value);
                                            setFieldTouched("description", true, false);
                                        }}
                                        modules={modules}
                                        formats={formats}
                                        theme="snow"
                                        className="quill-editor"
                                    />
                                </AntForm.Item>

                                <Divider size="small" />

                                {/* Department Selection (for HOD only) */}
                                {userRole === "HOD" && (
                                    <Row gutter={16}>
                                        <Col xs={24}>
                                            <CSelect
                                                label="Select Department"
                                                name="assignToDepartment"
                                                placeholder="Select Department"
                                                onChange={(value) => {
                                                    setFieldValue("assignToDepartment", value);
                                                    setFieldValue("assignee", "");
                                                }}
                                                onBlur={handleBlur}
                                                value={values.assignToDepartment || ""}
                                                data={[
                                                    { key: "ownDepartment", label: "Own Department" },
                                                    { key: "otherDepartment", label: "Other Departments" },
                                                ]}
                                                error={submitCount ? errors.assignToDepartment : touched.assignToDepartment && errors.assignToDepartment}
                                            >
                                            </CSelect>
                                        </Col>
                                    </Row>
                                )}

                                <Row gutter={16}>
                                    {/* Type */}
                                    <Col xs={24} md={12}>
                                        <CSelect
                                            label="Type"
                                            name="type"
                                            placeholder="Select role"
                                            value={values.type || undefined}
                                            onChange={(value) => setFieldValue("type", value)}
                                            onBlur={handleBlur}
                                            data={[
                                                { key: "MEMO", label: "Memo" },
                                                { key: "TASK", label: "Task" },
                                                { key: "BUG", label: "Bug" },
                                            ]}
                                            error={submitCount ? errors.type : touched.type && errors.type}
                                        >
                                        </CSelect>
                                    </Col>

                                    {/* Assignee - depends on department selection */}
                                    <Col xs={24} md={12}>
                                        <AntForm.Item
                                            label={<span className="form-label">
                                                {values.assignToDepartment === "ownDepartment"
                                                    ? "Select Employee"
                                                    : "Assign To HOD"}
                                            </span>}
                                            validateStatus={touched.assignee && errors.assignee ? "error" : ""}
                                            help={touched.assignee && errors.assignee ? (
                                                <span className="error-message">{errors.assignee}</span>
                                            ) : null}
                                        >
                                            <Select
                                                name="assignee"
                                                showSearch
                                                placeholder="Select assignee"
                                                onChange={(value) => setFieldValue("assignee", value)}
                                                onBlur={handleBlur}
                                                value={values.assignee || undefined}
                                                className="form-input"
                                            >
                                                {values.assignToDepartment === "ownDepartment"
                                                    ? (
                                                        Array.isArray(hodEmployees) && hodEmployees.length > 0
                                                            ? hodEmployees.map((item) => (
                                                                <Option key={item.id} value={item.id}>
                                                                    <div className="select-option">
                                                                        {item.id === userId ? (
                                                                            <span className="option-username">Assign To Me</span>
                                                                        ) : (
                                                                            <>
                                                                                <span className="option-username">{item.username}</span>
                                                                                <span className="option-dot">•</span>
                                                                                <span className="option-role">{readableText(item.role)}</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </Option>
                                                            ))
                                                            : <Option disabled>No Employees Found</Option>
                                                    )
                                                    : (
                                                        Array.isArray(hodsList) && hodsList.length > 0
                                                            ? hodsList.map((item) => (
                                                                <Option key={item.id} value={item.id}>
                                                                    <div className="select-option">
                                                                        <span className="option-username">{item.username}</span>
                                                                        <span className="option-dot">•</span>
                                                                        <span className="option-role">{item.teamName}</span>
                                                                    </div>
                                                                </Option>
                                                            ))
                                                            : <Option disabled>No HOD Found</Option>
                                                    )}
                                            </Select>
                                        </AntForm.Item>
                                    </Col>
                                </Row>

                                {/* Priority + Deadline (not for MEMO) */}
                                {values.type !== "MEMO" && (
                                    <Row gutter={16}>
                                        <Col xs={24} md={12}>
                                                <CSelect
                                                    label="Priority"
                                                    name="priority"
                                                    placeholder="Select priority"
                                                    onChange={(value) => setFieldValue("priority", value)}
                                                    onBlur={handleBlur}
                                                    value={values.priority || undefined}
                                                    data={[
                                                        { key: "HIGH", label: "High" },
                                                        { key: "MEDIUM", label: "Medium" },
                                                        { key: "LOW", label: "Low" },
                                                    ]}
                                                    error={submitCount ? errors.priority : touched.priority && errors.priority}
                                                >
                                                </CSelect>
                                        </Col>

                                        <Col xs={24} md={12}>
                                            <AntForm.Item
                                                label={<span className="form-label">Deadline</span>}
                                                validateStatus={touched.deadline && errors.deadline ? "error" : ""}
                                                help={touched.deadline && errors.deadline ? (
                                                    <span className="error-message">{errors.deadline}</span>
                                                ) : null}
                                            >
                                                <DatePicker
                                                    name="deadline"
                                                    onChange={(value) => setFieldValue("deadline", value)}
                                                    onBlur={handleBlur}
                                                    value={values.deadline || null}
                                                    placeholder="MM/DD/YYYY"
                                                    className="form-input"
                                                    disabledDate={(current) =>
                                                        current && current < new Date().setHours(0, 0, 0, 0)
                                                    }
                                                />
                                            </AntForm.Item>
                                        </Col>
                                    </Row>
                                )}

                                <div className="form-actions">
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        className="submit-button"
                                        block
                                        loading={createTaskLoading}
                                    >
                                        Create Task
                                    </Button>
                                </div>
                            </Form>
                        );
                    }}
                </Formik>
            </div>
        </Modal>
    );
};

export default CreateTaskModal;
