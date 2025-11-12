import React, { useEffect, useState } from 'react'
import { ContainerWrapper } from '../../container'
import { CTable } from '../../uiComponents';
import { FaCheck } from 'react-icons/fa6';
import CSelect from '../../uiComponents/cSelect/CSelect';
import "./LeaveApprovals.css"
import { leaveApprovals } from '../../store/actions/Leaves.action';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ConditionalRendering, readableText, renderDate } from '../../utils/Methods';
import { MdOutlineCancel } from 'react-icons/md';
import Details from './Details';
import { Badge, Button, Input, Modal, Popconfirm, Space, Tag } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { TiMessages } from "react-icons/ti";

const LeaveApprovals = () => {

    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState({})
    const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);

    const { data, loading, userRole } = useSelector(({ leaves, auth }) => ({
        data: leaves?.leaveApprovalData,
        loading: leaves?.leaveApprovalLoading,
        userRole: auth?.user?.role
    }));

    useEffect(() => {
        dispatch(leaveApprovals());
    }, []);

    const handleDetails = (obj) => {
        setIsOpen(true);
        setSelected(obj)
    };

    const pageHeaderProps = {
        title: 'Leave - WFH Approvals',
    };

    const columns = [
        {
            title: 'Reqt. By',
            dataIndex: ['userId', 'username'],
            render: (val, record) => val || record.userId?.username || '-',
        },
        {
            title: 'Description',
            dataIndex: 'reason',
            render: (val) => val || '-',
        },
        // {
        //     title: 'Department',
        //     dataIndex: ['userId', 'department'],
        //     render: (val, record) => val || record.userId?.department || '-',
        // },
        {
            title: 'Type',
            dataIndex: 'category',
            render: (val) => val || '-',
        },
        {
            title: 'From Date',
            dataIndex: 'fromDate',
            render: (val) => renderDate(val),
        },
        {
            title: 'To Date',
            dataIndex: 'toDate',
            render: (val) => renderDate(val),
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            render: (val) => renderDate(val),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (val) =>
                <Tag className='approval-tag' color={val === 'PENDING' || val === 'REJECTED' ? "red" : "green"}>
                    {readableText(val) || '-'}
                </Tag>
        },
        {
            title: 'Remarks',
            dataIndex: 'remarks',
            render: (val, record) => (
                <>
                    <Badge
                        count="1"
                        size="small"
                        onClick={() => setIsRemarksModalOpen(true)}
                        style={{ cursor: 'pointer' }}
                    >
                        <TiMessages className='reason-icon' />
                    </Badge>

                    <Modal
                        open={isRemarksModalOpen}
                        onCancel={() => setIsRemarksModalOpen(false)}
                        footer={null}
                    >
                        <div className="remarksModal">
                            <h1 className='form-title margin-bottom-20'>Remarks</h1>
                            <Input.TextArea
                                rows={4}
                                defaultValue={record.remarks || ""}
                                placeholder="Remarks"
                                readOnly
                            />
                        </div>
                    </Modal>
                </>
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (record) => (
                <Space size="small">
                    <Button
                        size="middle"
                        icon={<EyeOutlined />}
                        onClick={() => handleDetails(record)}
                    >
                        View
                    </Button>
                    <ConditionalRendering
                        condition={userRole !== 'EMPLOYEE' && record?.status === 'PENDING'}
                        children={<Popconfirm
                            title="Accept Task"
                            description="Do you want to accept this task?"
                            okText="Yes"
                            cancelText="No"
                            onConfirm={() => actionHandler('APPROVE', record)}
                            onCancel={""}
                        >
                            <Button
                                type="primary"
                                style={{ background: "#52b167", borderColor: "#52b167" }}
                            >
                                Accept
                            </Button>
                        </Popconfirm>} />
                </Space>
            ),
        },
    ];

    return (
        <div className={`${isOpen ? "blur-bg" : ""}`}>

            <ContainerWrapper pageHeaderProps={pageHeaderProps}>
                <div className='department-detail-container'>
                    <div className="table-wrapper">
                        <div className="page-header-filters">
                            <div className="status-filter">
                                <CSelect title='Priority' name="priority" />
                            </div>
                            <div className="status-filter">
                                <CSelect title='Status' name="status" />
                            </div>
                        </div>
                        <CTable
                            columns={columns}
                            data={data}
                            loading={loading}
                        />
                    </div>
                </div>
            </ContainerWrapper>
            <Details selected={selected} setSelected={setSelected} isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>

    );
};

export default LeaveApprovals;
