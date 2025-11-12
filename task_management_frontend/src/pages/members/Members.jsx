import React, { useEffect, useState } from 'react'
import { Button, Popconfirm, Space, Table, Tag } from 'antd'
import { PageHeader, Profile } from '../../components'
import { useDispatch, useSelector } from 'react-redux'
import { getMembers } from '../../store/actions/Members.action'
import { UserAvatar } from '../../components/userAvatar/UserAvatar'
import { ConditionalRendering, readableText } from '../../utils/Methods'
import { EyeOutlined } from '@ant-design/icons'
import { updateStatus } from '../../store/actions/Users.action'
import ContainerWrapper from '../../container/containerWrapper/ContainerWrapper'
import { CTable } from '../../uiComponents'

const Members = () => {

    const [isAddMember, setIsAddMember] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [refresh, setRefresh] = useState(false);


    const dispatch = useDispatch()

    const { loading, data, userRole } = useSelector(({ members, auth }) => ({
        data: members?.membersList,
        loading: members?.membersLoading,
        userRole: auth?.user?.role
    }));

    const handleViewProfile = (record) => {
        setSelectedUser(record);
        setIsProfileOpen(true);
    };

    useEffect(() => {
        dispatch(getMembers());
    }, [dispatch, refresh]);

    const callBack = () => {
        dispatch(getMembers())
    }

    const updateUserStatusHandler = (record) => {
        let payload = {
            id: record._id,
            isActive: !record.isActive,
        };

        dispatch(updateStatus(payload, callBack));
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'username',
            render: val => (
                <div className='d-flex gap-10 align-item-center'>
                    <UserAvatar name={val} /> {val}
                </div>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            render: (val) => readableText(val) || '-'
        },
        {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            render: (val) => (
                <Tag color={val ? "green" : "red"} className="approval-tag">
                    {val ? "Active" : "Disabled"}
                </Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        size="middle"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewProfile(record)}
                    >
                        View
                    </Button>
                    <ConditionalRendering
                        condition={['SUPER_ADMIN', 'MANAGER', 'SUB_ADMIN'].includes(userRole)}
                        children={<Popconfirm
                            title={record.isActive ? "Disable this member?" : "Activate this member?"}
                            okText="Yes"
                            cancelText="No"
                            onConfirm={() => updateUserStatusHandler(record)}
                        >
                            <Button
                                type="primary"
                                danger={record.isActive}
                                style={{
                                    backgroundColor: record.isActive ? "#FF4D4F" : "#56D18B",
                                    borderColor: record.isActive ? "#FF4D4F" : "#56D18B",
                                }}
                            >
                                {record.isActive ? "Disable" : "Active"}
                            </Button>
                        </Popconfirm>
                        }
                    />


                </Space>
            ),
        },
    ];

    const pageHeaderProps = {
        isAddMember: isAddMember,
        setIsAddMember: setIsAddMember,
        title: "Members",
        renderAddMemberButton: true,
        onMemberAdded: () => setRefresh(!refresh),
    }

    return (
        <>
            <ContainerWrapper pageHeaderProps={pageHeaderProps}>
                <div className='department-detail-container'>
                    <div className="table-wrapper">
                        <CTable
                            columns={columns}
                            dataSource={data}
                            loading={loading}
                            rowKey={(record) => record._id || record.email}
                        />
                    </div>
                </div>
            </ContainerWrapper >
            <Profile
                isProfileOpen={isProfileOpen}
                setIsProfileOpen={setIsProfileOpen}
                userData={selectedUser}
                onDeleteSuccess={() => setRefresh(!refresh)}
            />
        </>

    )
}

export default Members