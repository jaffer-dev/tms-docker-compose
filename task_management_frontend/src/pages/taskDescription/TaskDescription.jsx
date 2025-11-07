import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Button, Upload, Input, message, Divider, Steps, Tag, Dropdown, Space } from 'antd';
import { UploadOutlined, DeleteOutlined, PlusOutlined, FlagFilled, DownOutlined } from '@ant-design/icons';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AiFillFileExcel } from 'react-icons/ai';
import Loader from '../../components/loader/Loader';
import { getTaskDetails, submitForReview, setStatus } from '../../store/actions/Task.action';
import { ConditionalRendering, readableText, renderDate, TASK_PRIORITY_COLORS, TASK_STATUS_COLORS, TASK_STATUS_ICONS, TASK_TYPE_COLORS } from '../../utils/Methods';
import { AssignTaskModal } from '../../components';
import { UserAvatar } from '../../components/userAvatar/UserAvatar';
import { handleUpload, handleRemoveFile, generateTaskPDF, fileBlog } from './Helper';
import './TaskDescription.css';
import TaskComments from '../../components/taskComments/TaskComments';

const { Step } = Steps;

const TaskDetails = () => {
  const dispatch = useDispatch();
  const { taskId } = useParams()
  const navigate = useNavigate();

  const { taskDetails, getTaskDetailsLoading, userRole, userId, userName, statusLoading, submitForReviewLoading } = useSelector(({ task, auth }) => ({
    taskDetails: task?.getTaskDetails,
    getTaskDetailsLoading: task?.getTaskDetailsLoading,
    userRole: auth?.user?.role,
    userId: auth?.user?._id,
    userName: auth?.user?.username,
    statusLoading: task?.getStatusLoading,
    submitForReviewLoading: task?.submitForReviewLoading
  }));


  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [link, setLink] = useState('');
  const [isOpenAssignModal, setIsOpenAssignModal] = useState(false);

  const handleAssignTo = () => {
    const assignedActions = taskDetails?.actions?.filter(a => a?.assignedTo) || [];
    const lastAssigned = assignedActions.at(-1)?.assignedTo || null;
    const isUserAssigned = assignedActions.some(a => a?.assignedTo?.id === userId);

    if (taskDetails?.type === 'MEMO') {
      return 'To Department'
    }

    if (['HOD', 'SUPERVISOR'].includes(userRole)) {
      return (
        <>
          <span>{lastAssigned?.username ? lastAssigned?.username : 'Not assigned to you'}</span>
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={() => setIsOpenAssignModal(true)}
          >
            Reassign
          </Button>
        </>
      )
    }
    if (['EMPLOYEE'].includes(userRole)) {
      return (
        <>
          <span>{isUserAssigned ? 'Assigned You' : 'Not assigned to you'}</span>
        </>
      )
    }
    if (['SUPER_ADMIN', 'SUB_ADMIN', 'MANAGER'].includes(userRole)) {
      return (
        <>
          <span>{lastAssigned?.username ? lastAssigned?.username : 'Not assigned to you'}</span>
        </>
      )
    }

  }

  useEffect(() => {
    if (taskId) {
      dispatch(getTaskDetails(taskId));
    }
  }, [taskId]);

  const handleSubmitForReview = async () => {
    if (uploadedFiles.length === 0 && !link.trim()) {
      return message.error('Please upload at least one file or provide a link');
    }
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('taskId', taskId);
      uploadedFiles.forEach((file) => formData.append('files', file));
      if (link.trim()) formData.append('link', link.trim());
      await dispatch(submitForReview(formData));
      setUploadedFiles([]);
      setLink('');
      dispatch(getTaskDetails(taskId));
    } catch (error) {
      console.error('Submission error:', error);
      message.error('Failed to submit work for review');
    }
  };

  if (getTaskDetailsLoading) return <Loader />;

  const isHistoryView =
    taskDetails?.type === "MEMO" ||
    taskDetails?.assignTo?.some(a => a?._id !== userId);

  const items = [
    { key: "TODO", label: "Todo" },
    { key: "PENDING", label: "Pending" },
    { key: "IN_PROGRESS", label: "In Progress" },
    { key: "REVIEW", label: "Review" },
    { key: "COMPLETED", label: "Completed" },
  ];

  const callBack = () => {
    dispatch(getTaskDetails(taskId))
  }

  const changeStatus = ({ key }) => {
    const payload = {
      taskId: taskDetails.id,
      status: key,
    };
    dispatch(setStatus(payload, callBack));
  };

  const getLabelByKey = (key) => {
    const found = items.find((item) => item.key === key);
    return found ? found.label : key;
  };

  return (
    <div className="description-history-wrapper">
      <Card className="description-history-card">
        <div className="description-header">

          <div className="description-header-left">
            <div className="header-wrapper-icon">
              <button className="back-button" onClick={() => navigate('/task-history')}>
                <FaArrowLeftLong />
              </button>
            </div>
            <h1 className="form-title">{taskDetails?.taskTitle || 'Task Details'}</h1>
          </div>
          <div className="description-header-right">
            <Button type="primary" shape="round" onClick={() => generateTaskPDF(taskDetails, userName, userRole)} icon={<AiFillFileExcel />}>
              <span className="btn-text">Export</span>
            </Button>
          </div>
        </div>

        <div className="description-content">
          <Card title="Description" className="description-section">
            <div className="description-paragraph" dangerouslySetInnerHTML={{ __html: taskDetails?.description || '' }} />
          </Card>

          <Descriptions column={1} bordered>
            <Descriptions.Item label="Status">
              <ConditionalRendering condition={taskDetails?.type === 'MEMO'}
                children={
                  <Space>
                    <span>Alert</span>
                    {TASK_PRIORITY_COLORS(taskDetails.priority)}
                  </Space>
                } elseChildren={
                  <Dropdown menu={{ items, onClick: changeStatus }} trigger={['click']}>
                    <Button loading={statusLoading} >
                      <a onClick={e => e.preventDefault()}>
                        <Space color={TASK_STATUS_COLORS[taskDetails?.status?.toLowerCase()] || 'default'}>
                          {getLabelByKey(taskDetails?.status)}
                          <DownOutlined />
                        </Space>
                      </a>
                    </Button>
                  </Dropdown>} />

            </Descriptions.Item>

            <Descriptions.Item label="Priority">
              <Space>
                {TASK_PRIORITY_COLORS(taskDetails.priority)}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              <Space>
                {taskDetails?.type && (() => {
                  const type = taskDetails.type.toUpperCase();
                  const colors = TASK_TYPE_COLORS[type] || {};

                  return (
                    <Tag
                      className="approval-tag"
                      style={{
                        color: colors.color,
                        backgroundColor: colors.background,
                      }}
                    >
                      {readableText(type)}
                    </Tag>
                  );
                })()}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Assigned">{handleAssignTo()}</Descriptions.Item>
            <Descriptions.Item label="Deadline">
              {taskDetails?.deadline ? renderDate(taskDetails.deadline).toLocaleString() : 'No deadline'}
            </Descriptions.Item>
          </Descriptions>
        </div>
        {!isHistoryView && (
          (
            <Card title={
              <div className='submit-header'>
                <span>Upload File</span>
                <Button
                  type="primary"
                  shape="round"
                  className="mt-2"
                  onClick={handleSubmitForReview}
                  loading={submitForReviewLoading}
                  disabled={submitForReviewLoading || (uploadedFiles.length === 0 && !link.trim())}
                >
                  Upload File
                </Button>
              </div>
            } className="history-section" style={{ marginTop: 50 }}>
              <Upload.Dragger
                multiple
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
              <Divider plain>OR</Divider>
              <Input
                addonBefore="Paste Link"
                placeholder="https://example.com/work-submission"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />


            </Card>
          )
        )}
      </Card>

      <AssignTaskModal
        isOpenAssignModal={isOpenAssignModal}
        setIsOpenAssignModal={setIsOpenAssignModal}
        userId={userId}
        taskId={taskId}
      />

      <TaskComments />
    </div>
  );
};

export default TaskDetails;