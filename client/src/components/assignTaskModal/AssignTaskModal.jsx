import { Checkbox, List, Modal, Button, Empty, Spin, Tag } from 'antd'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getHodEmployees } from '../../store/actions/Departments.action'
import { UserAvatar } from '../userAvatar/UserAvatar'
import { assignTaskToEmployee, getTaskDetails } from '../../store/actions/Task.action'
import './AssignTaskModal.css'

const AssignTaskModal = ({ isOpenAssignModal, setIsOpenAssignModal, userId, taskId }) => {
    const dispatch = useDispatch()
    const [selectedMembers, setSelectedMembers] = useState({});

    const { assignTaskLoading, hodEmployees, getHodEmployeesLoading } = useSelector(({ departments, task }) => ({
        assignTaskLoading: task?.assignTaskToEmployeeLoading,
        hodEmployees: departments.hodEmployees,
        getHodEmployeesLoading: departments.getHodEmployeesLoading,
    }));

    const handleMemberToggle = (member, checked) => {
        if (checked) {
            setSelectedMembers({ [member.id]: member });
        } else {
            setSelectedMembers({});
        }
    };

    const onCancel = () => {
        if (!assignTaskLoading) {
            setIsOpenAssignModal(false);
        }
    };

    const callBack = () => {
        setSelectedMembers({});
        setIsOpenAssignModal(false);
        dispatch(getTaskDetails(taskId));
    };

    const handleSubmit = () => {
        const selectedUserIds = Object.keys(selectedMembers)[0];
        const payload = {
            taskId,
            assignerId: userId,
            assigneeId: selectedUserIds,
        };
        dispatch(assignTaskToEmployee(payload, callBack));
    };

    useEffect(() => {
        if (isOpenAssignModal) {
            dispatch(getHodEmployees({ userId }));
        }
    }, [isOpenAssignModal, userId, dispatch]);

    return (
        <Modal
            open={isOpenAssignModal}
            footer={false}
            onCancel={onCancel}
            width={460}
            className="assign-task-modal"
            bodyStyle={{ padding: 0 }}
        >
            <div className="assign-task-wrapper">
                {/* Header */}
                <div className="assign-task-header">
                    <h2 className="form-title">Assign Task</h2>
                    <p className="form-subtitle">Choose one team member to assign this task</p>
                </div>

                {/* Employee List */}
                <div className="assign-task-body">
                    {getHodEmployeesLoading ? (
                        <Spin style={{ width: "100%", marginTop: 40 }} />
                    ) : hodEmployees?.length === 0 ? (
                        <Empty description="No employees available" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    ) : (
                        <List
                            dataSource={hodEmployees}
                            className="member-list"
                            renderItem={(member) => (
                                <List.Item
                                    key={member.id}
                                    className={`member-card ${selectedMembers[member.id] ? "selected" : ""}`}
                                    onClick={() => handleMemberToggle(member, !selectedMembers[member.id])}
                                >
                                    <div className="member-info">
                                        <UserAvatar name={member.username} />
                                        <div className="member-details">
                                            <div className="member-name">{member.username}</div>
                                            <Tag color="blue" className="role-tag">
                                                {member.designation || member.role}
                                            </Tag>
                                        </div>
                                    </div>
                                    <Checkbox
                                        checked={!!selectedMembers[member.id]}
                                        onChange={(e) => handleMemberToggle(member, e.target.checked)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </List.Item>
                            )}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="form-actions">
                    <Button
                        block
                        type="primary"
                        size="large"
                        shape="round"
                        disabled={
                            assignTaskLoading || Object.keys(selectedMembers).length === 0
                        }
                        loading={assignTaskLoading}
                        onClick={handleSubmit}
                    >
                        Assign Task
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AssignTaskModal;
