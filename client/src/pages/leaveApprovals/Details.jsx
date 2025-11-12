import { Button, Drawer, Flex, Input, Modal, Popconfirm } from 'antd'
import React, { useState } from 'react'
import './Details.css'
import { renderAssigneeDetails, renderTaskDetails } from './Helper'
import { useDispatch, useSelector } from 'react-redux'
import { handleApproval, leaveApprovals } from '../../store/actions/Leaves.action'

const Details = ({ isOpen, setIsOpen, selected }) => {

    const dispatch = useDispatch();

    const { loading, userRole, leaveData } = useSelector(({ approvals, auth, leaves }) => ({
        loading: approvals?.actionLoading,
        userRole: auth?.user?.role,
        leaveData: leaves?.leaveApprovalData
    }))

    const [reasonModalOpen, setReasonModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    const onCancel = () => {
        setIsOpen(false)
    }

    const callback = () => {
        setIsOpen(false)
        dispatch(leaveApprovals())
    }

    const onSubmit = (status, remarks = "") => {
        const leaveId = selected._id;

        console.log(selected, "leaveId")

        const payload = {
            status,
            remarks,
        };
        dispatch(handleApproval(leaveId, payload, callback));
        setReasonModalOpen(false);
        setRejectReason("");
    };


    const footer = () => {
        if (userRole !== 'EMPLOYEE' && selected?.status === 'PENDING') {
            return (
                <Flex gap="small" style={{ width: "100%" }}>
                    <Button
                        danger
                        type="primary"
                        loading={loading}
                        disabled={loading}
                        style={{ flex: 1, background: "#f5222d", borderColor: "#f5222d" }}
                        onClick={() => setReasonModalOpen(true)}
                    >
                        Reject
                    </Button>

                    <Button
                        type="primary"
                        loading={loading}
                        disabled={loading}
                        style={{ flex: 1, background: "#52b167", borderColor: "#52b167" }}
                        onClick={() => onSubmit("APPROVED")}
                    >
                        Accept
                    </Button>

                    <Modal
                        title="Reject Reason"
                        open={reasonModalOpen}
                        onOk={() => onSubmit("REJECTED", rejectReason)}
                        onCancel={() => setReasonModalOpen(false)}
                        okButtonProps={{ disabled: !rejectReason.trim() }}
                    >
                        <Input.TextArea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Please provide a reason for rejection"
                            rows={4}
                        />
                    </Modal>
                </Flex>
            );
        }
        return null;
    };



    return (
        <Drawer title="Task Details" className='approval-details' loading={loading} onClose={!loading && onCancel} open={isOpen} footer={footer()} width={620}>
            {renderAssigneeDetails(selected)}
            {renderTaskDetails(selected)}
        </Drawer>
    )
}

export default Details
