import React, { use, useEffect, useState } from 'react'
import { PageHeader } from '../../components'
import { Popconfirm, Table, Tag } from 'antd';
import { Button, Drawer, Radio, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { approvalAction, getApprovals } from '../../store/actions/Approvals.action';
import { ConditionalRendering, PRIORITY, readableText, renderDate, TASK_PRIORITY_COLORS, TASK_TYPE_COLORS } from '../../utils/Methods';
import { EyeOutlined, FlagFilled } from '@ant-design/icons';
import Details from './Details';
import { getAllTask } from '../../store/actions/Task.action';
import "./Approval.css"
import CSelect from '../../uiComponents/cSelect/CSelect';
import { ContainerWrapper } from '../../container';
import { CTable } from '../../uiComponents';

const Approvals = () => {

    const dispatch = useDispatch()

    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState({})

    const { data, loading, userRole } = useSelector(({ approvals, auth }) => {
        return {
            data: approvals.approvalsData,
            loading: approvals?.getApprovalsLoading,
            userRole: auth?.user?.role
        }
    });

    const handleDetails = (obj) => {
        setIsOpen(true);
        setSelected(obj)
    };

    const callback = () => {
        dispatch(fetApprovals())
    }

    const actionHandler = (val, obj = {}) => {
        let payload = {
            action: val,
            approvalId: obj?._id
        }
        dispatch(approvalAction(payload, callback))
    }

    const fetApprovals = () => {
        dispatch(getApprovals())
    }
    useEffect(() => {
        fetApprovals()
    }, [])


    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            render: (val, record) => (
                <div className="title-priority">
                    {val}
                    {TASK_PRIORITY_COLORS(record.priority)}
                </div>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            render: (val) => {
                const type = val?.toUpperCase();
                const colors = TASK_TYPE_COLORS[type] || {};
                return (
                    <Tag
                        style={{ color: colors.color, backgroundColor: colors.background, }} className='approval-tag' >
                        {readableText(type)}
                    </Tag>
                );
            }
        },
        {
            title: 'Deadline',
            dataIndex: 'deadline',
            render: (val) => renderDate(val) || '-'
        },
        {
            title: 'Create by',
            dataIndex: 'requestedBy',
            render: (val, obj) => readableText(val?.username) || '-'
        },
        {
            title: 'Assign To',
            dataIndex: 'assignTo',
            render: (val, obj) => readableText(val?.username) || '-'
        },
        {
            title: 'Approval Status',
            dataIndex: 'status',
            render: (val) =>
                <Tag className='approval-tag' color={val === 'PENDING' ? "red" : "green"}>
                    {readableText(val) || '-'}
                </Tag>
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

    const pageHeaderProps = {
        // renderBack: true,
        title: "Approvals"
    }


    return (
        <div className={`${isOpen ? "blur-bg" : ""}`}>
            <ContainerWrapper pageHeaderProps={pageHeaderProps}>
            <div className='department-detail-container'>
                <div className="table-wrapper">
                    <CTable
                        columns={columns}
                        dataSource={data}
                        loading={loading}
                    />
                </div>
            </div>
            </ContainerWrapper>
            <Details selected={selected} setSelected={setSelected} isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
    )
}

export default Approvals