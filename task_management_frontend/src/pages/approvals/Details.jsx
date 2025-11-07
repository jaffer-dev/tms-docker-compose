import { Badge, Button, Descriptions, Divider, Drawer, Flex, Popconfirm } from 'antd'
import React from 'react'
import './Details.css'
import { renderAssigneeDetails, renderTaskDetails } from './Helper'
import { useDispatch, useSelector } from 'react-redux'
import { approvalAction, getApprovals } from '../../store/actions/Approvals.action'

const Details = ({ isOpen, setIsOpen, selected }) => {

    const dispatch = useDispatch();

    const { loading, userRole } = useSelector(({approvals, auth}) => ({
        loading : approvals?.actionLoading,
        userRole : auth?.user?.role
    }))

    const onCancel = () => {
        setIsOpen(false)
    }

    const callback = () => {
        setIsOpen(false)
        dispatch(getApprovals())
    }

    const onSubmit = (val) => {
        let payload = {
            action: val,
            approvalId: selected?._id
        }
        dispatch(approvalAction(payload, callback))
    }

    const footer = () => {
        console.log(selected?.status === 'PENDING')
        if (userRole !== 'EMPLOYEE' && selected?.status === 'PENDING'){
            return (
                <Flex gap="small" style={{ width: "100%" }}>
                    <Popconfirm
                        title="Reject Task"
                        description="Are you sure you want to reject this task?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => onSubmit('REJECT')}
                        onCancel={""}
                    >
                        <Button
                            danger
                            type="primary"
                            loading={loading}
                            disabled={loading}
                            style={{ flex: 1, background: "#f5222d", borderColor: "#f5222d" }}
                        >
                            Reject
                        </Button>
                    </Popconfirm>

                    <Popconfirm
                        title="Accept Task"
                        description="Do you want to accept this task?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => onSubmit('APPROVE')}
                        onCancel={""}
                    >
                        <Button
                            type="primary"
                            loading={loading}
                            disabled={loading}
                            style={{ flex: 1, background: "#52b167", borderColor: "#52b167" }}
                        >
                            Accept
                        </Button>
                    </Popconfirm>
                </Flex>
            )
        };
        return null
    };


    return (
        <Drawer title="Task Details" className='approval-details' loading={loading} onClose={!loading && onCancel} open={isOpen} footer={footer()} width={620}>
            {renderAssigneeDetails(selected)}
            {renderTaskDetails(selected)}
        </Drawer>
    )
}

export default Details
