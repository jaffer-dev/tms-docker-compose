import React, { useEffect, useState } from 'react';
import { Button, Popconfirm, Space, Table, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNonHRUsers, updateStatus } from '../../store/actions/Users.action';
import { UserAvatar } from '../userAvatar/UserAvatar';
import { ConditionalRendering, readableText } from '../../utils/Methods';
import { EyeOutlined } from '@ant-design/icons';
import Profile from '../profile/Profile';
import "./Departments.css"
import { CTable } from '../../uiComponents';

const EmployeesList = () => {
  const dispatch = useDispatch();

  const { user, userLoading, userRole } = useSelector(({ users, auth }) => {
    return {
      user: users?.getNonHrUsers || [],
      userLoading: users.getNonHrUsersLoading,
      userRole: auth?.user?.role
    };
  });

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    dispatch(fetchNonHRUsers());
  }, []);

  const handleViewProfile = (record) => {
    setSelectedUser(record);
    setIsProfileOpen(true);
  };

  const callBack = () => {
    dispatch(fetchNonHRUsers());
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
      key: 'username',
      render: (val) => (
        <div className="d-flex align-item-center justify-center gap-10">
          <UserAvatar name={val || ''} />
          {readableText(val)}
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      render: (val) => readableText(val.title) || '-',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (val) => readableText(val) || '-',
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (val) => (
        <Tag color={val ? "green" : "red"}>
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

  return (
    <div className="employees-list-main">
      <CTable
        columns={columns}
        dataSource={
          user.length
            ? user.map((item, idx) => ({ ...item, key: item._id || idx }))
            : []
        }
        loading={userLoading}
        pagination={undefined}
      />

      <Profile
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        userData={selectedUser}
      />
    </div>
  );
};

export default EmployeesList;